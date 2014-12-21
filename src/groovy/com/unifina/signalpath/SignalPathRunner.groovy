package com.unifina.signalpath

import grails.util.GrailsUtil

import javax.servlet.ServletContext

import org.apache.log4j.Logger

import com.unifina.push.PushChannel
import com.unifina.push.SocketIOPushChannel
import com.unifina.service.SignalPathService
import com.unifina.signalpath.SignalPath.DoneMessage
import com.unifina.signalpath.SignalPath.ErrorMessage
import com.unifina.utils.Globals


/**
 * A Thread that instantiates and runs a list of SignalPaths.
 * Identified by a runnerId, by which this runner can be looked up from the
 * servletContext["signalPathRunners"] map.
 */
public class SignalPathRunner extends Thread {
	
	private List<Map> signalPathData
	private final List<SignalPath> signalPaths = Collections.synchronizedList([])
	private PushChannel pushChannel;
	
	String runnerId
	
	Globals globals
	
	ServletContext servletContext
	SignalPathService signalPathService
	
	// Have the SignalPaths been instantiated?
	boolean ready = false
	
	private static final Logger log = Logger.getLogger(SignalPathRunner.class)
	
	public SignalPathRunner(List<Map> signalPathData, Globals globals) {
		this.globals = globals
		this.signalPathService = globals.grailsApplication.mainContext.getBean("signalPathService")
		this.servletContext = globals.grailsApplication.mainContext.getBean("servletContext")
		this.signalPathData = signalPathData
		
		runnerId = "s-"+new Date().getTime()
		
		if (!servletContext["signalPathRunners"])
			servletContext["signalPathRunners"] = [:]
			
		servletContext["signalPathRunners"].put(runnerId,this)
		
		pushChannel = new SocketIOPushChannel();
	}
	
	public String getReturnChannel(int index) {
		return signalPaths[index].uiChannelId
	}
	
	public Map getModuleChannelMap(int signalPathIndex) {
		Map result = [:]
		signalPaths[signalPathIndex].modules.each {
			if (it instanceof ModuleWithUI) {
				result.put(it.hash.toString(), it.uiChannelId)
			}
		}
		return result
	}
	
	@Override
	public void run() {
		
		Throwable reportException = null
		setName("SignalPathRunner");
		
		// Run
		try {
			globals.dataSource = signalPathService.createDataSource(globals.signalPathContext, globals)
			globals.init()

			if (globals.signalPathContext.csv) {
				globals.signalPathContext.speed = 0
			}

			// Instantiate SignalPaths from JSON
			for (int i=0;i<signalPathData.size();i++) {
				try {
					SignalPath signalPath = signalPathService.jsonToSignalPath(signalPathData[i],false,globals,pushChannel,true)
					signalPaths.add(signalPath)
				} catch (Exception e) {
					e = GrailsUtil.deepSanitize(e)
					log.error("Error while instantiating SignalPaths!",e)
					pushChannel.push(new ErrorMessage(e.getMessage() ?: e.toString()), runnerId)
				}
			}

			for (SignalPath it : signalPaths)
				it.connectionsReady()

			ready = true
			if (!signalPaths.isEmpty())
				signalPathService.runSignalPaths(signalPaths)
		} catch (Throwable e) {
			e = GrailsUtil.deepSanitize(e)
			log.error("Error while running SignalPaths!",e)
			reportException = e
		}

		// Cleanup
		try {
			destroy()
		} catch (Exception e) {
			e = GrailsUtil.deepSanitize(e)
			log.error("Error while destroying SignalPathRunner!",e)
		}

		if (reportException) {
			StringBuilder sb = new StringBuilder(reportException.message)
			while (reportException.cause!=null) {
				reportException = reportException.cause
				sb.append("<br><br>")
				sb.append("Caused by: ")
				sb.append(reportException.message)
			}
			signalPaths.each {SignalPath sp->
				pushChannel.push(new ErrorMessage(sb.toString()), sp.uiChannelId)
			}
		}
		
		signalPaths.each {SignalPath sp->
			pushChannel.push(new DoneMessage(), sp.uiChannelId)
		}

		log.info("SignalPathRunner is ready.")
	}
	
	/**
	 * Aborts the data feed and releases all resources
	 */
	public void destroy() {
		servletContext["signalPathRunners"].remove(runnerId)
		signalPaths.each {it.destroy()}
		globals.destroy()
	}
	
	public void abort() {
		log.info("Aborting SignalPathRunner..")
		globals.abort = true
		globals.dataSource?.stopFeed()
		destroy()
		
		// Interrupt whatever this thread is doing
		// Commented out because I witnessed a deadlock leading to this call, revisit later if necessary
		// This thread should exit anyway on the next event, so no big deal if not interrupted
		//this.interrupt()
	}
	
}
