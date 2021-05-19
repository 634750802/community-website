import React, { useEffect, useState } from 'react'
import { Location } from '@reach/router';
import styles from './Layout.module.scss'
import {useIntl} from "react-intl";
import {Footer,Header,UserProfile,utils} from '@tidb-community/ui'
import {getData,api} from '@tidb-community/datasource'
import helper from '../helper'
import { useDebounce } from 'ahooks'
import { navigate } from "gatsby"


export default function Layout({children, ...rest}) {

  const intl = useIntl()
  const locale = intl.locale

  const transparentDebounced = useDebounce(false, {wait: 100})
  const logoImageUrl = helper.getLogoByLocale(locale, transparentDebounced)

  const [meData, setData] = useState(undefined)

  useEffect(() => {
    api.me().then(({data}) => setData(data)).catch(() => {})
  }, [children])

  const { footer: footerData, header: headerData, } = getData({
    domain: 'contributor.tidb.io',
    path: '',
    locale: locale === 'zh' ? 'zh' : 'en',
    env: process.env.NEXT_PUBLIC_RUNTIME_ENV,
    meData,
  }).nav

  const { loginUrl, logoutUrl, userProfileNavItems } = headerData

  const Logo = () => (<>
    <div className={styles.logo}>
      <img src={logoImageUrl} alt="TiDB DevGroup"/>
    </div>
  </>)

  const onNavClick = ({ link }) => {
    if (/^http/.test(link)) {
      window.open(link)
    } else {
      navigate(link)
    }
  }

  const onTitleClick = () => {
    navigate('/')
  }

  const footerProps = {
    logo: <Logo/>,
    navItems: footerData.navItems,
    icons: footerData.icons,
    title: '',
    onNavClick,
  }

  const headerProps = ({ location }) => {
    const currentNav = utils.header.getCurrentNav(headerData.navItems, location.pathname)

    const doLogin = (redirectUrl) => {
      window.open(`${loginUrl}?redirect_to=${encodeURIComponent(redirectUrl ?? location.href)}`, '_top');
    };

    const doLogout = (redirectUrl) => {
      window.open(`${logoutUrl}?redirect_to=${encodeURIComponent(redirectUrl ?? location.href)}`, '_top');
    };

    return {
      logo: <Logo />,
      navItems: headerData.navItems,
      title: '',
      currentNav,
      onNavClick,
      onTitleClick,
      userProfileSlot: (
        <UserProfile
          onNavClick={onNavClick}
          onLoginClick={() => doLogin()}
          onLogoutClick={() => doLogout()}
          currentNav={currentNav}
          items={userProfileNavItems}
          avatarUrl={meData?.avatar_url}
          locale={locale}
          showBadge={meData?.org_invitations.reduce((pre, cur) => pre + (cur.valid ? 1 : 0), 0) > 0}
        />
      )
    }
  }

  return (
    <div>
      <Location>
        {location => (<>
          <div className='tidb-community-ui'>
            <Header {...headerProps(location)}/>
          </div>
          <main>
            {children}
          </main>
          <div className='tidb-community-ui'>
            <Footer {...footerProps}/>
          </div>
        </>)}
      </Location>
    </div>
  )
}
