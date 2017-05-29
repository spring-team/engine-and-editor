// @flux

import React, {Component} from 'react'

import NameEditor from './NameEditor'
import CanvasList from './CanvasList'
import DashboardTools from './DashboardTools'

export default class Sidebar extends Component {
    render() {
        return (
            <div id="main-menu" role="navigation">
                <div id="main-menu-inner">
                    <div id="sidebar-view" className="scrollable">
                        <NameEditor />
                        <CanvasList />
                        <DashboardTools />
                    </div>
                </div>
            </div>
        )
    }
}