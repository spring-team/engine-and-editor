package com.unifina.signalpath

import com.unifina.domain.signalpath.Module
import com.unifina.domain.signalpath.UiChannel

class UiChannelIterator implements Iterable<Element> {
	private final Iterator moduleIter
	private boolean isRootElement = true

	static UiChannelIterator over(Map signalPathMap) {
		return new UiChannelIterator(signalPathMap)
	}

	private UiChannelIterator(Map signalPathMap) {
		def modules = signalPathMap.modules.findAll { it.uiChannel }

		if (hasRootElement(signalPathMap)) {
			def fakeRootModule = [
				id       : null,
				hash     : null,
				uiChannel: [
					id  : signalPathMap.uiChannel.id,
					name: signalPathMap.uiChannel.name
				]
			]
			modules = [fakeRootModule] + modules
		}
		moduleIter = modules.iterator()
	}

	@Override
	Iterator<Element> iterator() {
		[
		    hasNext: { moduleIter.hasNext() },
			next: {
				def module = moduleIter.next()
				def element = new Element(module, isRootElement)
				isRootElement = false
				return element
			}
		] as Iterator<Element>
	}

	private boolean hasRootElement(Map signalPathMap) {
		return signalPathMap.uiChannel != null
	}

	public static class Element {
		boolean rootElement
		Map uiChannelData

		String id
		String name
		String hash
		Module module

		Element(Map moduleData, boolean rootElement) {
			this.rootElement = rootElement
			uiChannelData = moduleData.uiChannel

			id = uiChannelData.id
			name = uiChannelData.name
			hash = moduleData.hash?.toString()
			module = Module.load(moduleData.id)
		}

		UiChannel toUiChannel() {
			def ui = new UiChannel()
			ui.id = id
			ui.name = name
			ui.hash = hash
			ui.module = module
			return ui
		}
	}
}
