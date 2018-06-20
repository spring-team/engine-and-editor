// @flow

import * as React from 'react'

import AuthPanelNav from '../AuthPanelNav'
import styles from './authPanel.pcss'

type Props = {
    children: React.Node,
}

type State = {
    step: number,
    height: string | number,
}

class AuthPanel extends React.Component<Props, State> {
    state = {
        step: 0,
        height: 'auto',
    }

    onProceed = () => {
        const { children } = this.props
        const step = Math.min(React.Children.count(children) - 1, this.state.step + 1)

        this.setState({
            step,
        })
    }

    onGoBack = () => {
        this.setState({
            step: Math.max(0, this.state.step - 1),
        })
    }

    setHeight = (height: number) => {
        this.setState({
            height,
        })
    }

    titles = () => React.Children.map(this.props.children, (child) => child.props.title || 'Title')

    render = () => {
        const { children } = this.props
        const { step, height } = this.state

        return (
            <div className={styles.authPanel}>
                <div className={styles.navs}>
                    {React.Children.map(this.props.children, (child, index) => (
                        <AuthPanelNav
                            active={index === step}
                            signin={child.props.showSignin}
                            signup={child.props.showSignup}
                            onUseEth={child.props.showEth ? (() => {}) : null}
                            onGoBack={child.props.showBack ? this.onGoBack : null}
                        />
                    ))}
                </div>
                <div className={styles.panel}>
                    <div className={styles.header}>
                        {this.titles()[step]}
                    </div>
                    <div className={styles.body}>
                        <div
                            className={styles.inner}
                            style={{
                                height,
                            }}
                        >
                            {React.Children.map(children, (child, index) => React.cloneElement(child, {
                                active: index === step,
                                onProceed: this.onProceed,
                                onHeightChange: this.setHeight,
                            }))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default AuthPanel
