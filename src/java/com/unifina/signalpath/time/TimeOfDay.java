package com.unifina.signalpath.time;

import java.util.Date;

import com.unifina.datasource.ITimeListener;
import com.unifina.signalpath.AbstractSignalPathModule;
import com.unifina.signalpath.StringParameter;
import com.unifina.signalpath.TimeSeriesOutput;
import com.unifina.utils.TimeOfDayUtil;

public class TimeOfDay extends AbstractSignalPathModule implements ITimeListener {

	TimeSeriesOutput out = new TimeSeriesOutput(this,"out");
	
	StringParameter startTime = new StringParameter(this,"startTime","00:00:00");
	StringParameter endTime = new StringParameter(this,"endTime","23:59:59");

	TimeOfDayUtil util;
	
	Double currentOut = null;
	
	@Override
	public void init() {
		addInput(startTime);
		addInput(endTime);
		addOutput(out);
	}
	
	@Override
	public void initialize() {
		util = new TimeOfDayUtil(startTime.getValue(), endTime.getValue(), globals.getUserTimeZone());
	}
	
	@Override
	public void clearState() {
		currentOut = null;
	}
	
	@Override
	public void sendOutput() {
		
	}
	
	@Override
	public void onDay(Date day) {
		super.onDay(day);
		util.setBaseDate(day);
	}
	
	@Override
	public void setTime(Date timestamp) {
		if (util.isInRange(timestamp)) {
			if (currentOut==null || currentOut==0) {
				out.send(1D);
				currentOut = 1.0;
			}	
		}
		else if (currentOut==null || currentOut==1) {
			out.send(0D);
			currentOut = 0.0;
		}
	}

}