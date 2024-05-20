import React, { useState } from 'react';
import { StaticQuery, graphql, navigate } from 'gatsby';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faRssSquare, faSearch } from '@fortawesome/free-solid-svg-icons';
import {
  faSquareXTwitter,
  faGithubSquare,
  faFacebookSquare,
  faLinkedin,
} from '@fortawesome/free-brands-svg-icons';
import LoginSignup from 'components/loginSignup';
import logoImg from '../images/logo.svg';
import Link from './Link';
import config from '../../../config.js';

import Sidebar from '../sidebar';
import LanguageSwitcher from 'components/i18n/LanguageSwitcher';
import useLocalizePath from 'components/i18n/useLocalizePath';

const Header = ({ location = null }) => {
  const [navCollapsed, setNavCollapsed] = useState(true);

  return (
    <StaticQuery
      query={graphql`
        query headerTitleQuery {
          site {
            siteMetadata {
              headerTitle
              githubUrl
              facebookUrl
              linkedInUrl
              helpUrl
              tweetText
              logo {
                link
                image
                mobile
              }
            }
          }
        }
      `}
      render={(data) => {
        const {
          site: {
            siteMetadata: { headerTitle, githubUrl, logo, facebookUrl, linkedInUrl },
          },
        } = data;

        const finalLogoLink = logo.link !== '' ? logo.link : 'https://incidentdatabase.ai/';

        var SocialMediaIcons = () =>
          config.header.social && (
            <div className="hidden md:flex wrap-0 gap-2 items-center">
              <a href={'https://twitter.com/IncidentsDB'} target="_blank" rel="noreferrer">
                <FontAwesomeIcon
                  titleId="twitter"
                  icon={faSquareXTwitter}
                  color={'white'}
                  className="pointer fa fa-twitter-square fa-lg"
                  title="Open Twitter"
                />
              </a>
              <a href={'/rss.xml'} target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon
                  titleId="rss"
                  icon={faRssSquare}
                  color={'white'}
                  className="pointer fa fa-rss-square fa-lg"
                  title="Open RSS Feed"
                />
              </a>
              <a
                className="paddingAround hiddenMobile"
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon
                  titleId="facebook"
                  icon={faFacebookSquare}
                  color={'white'}
                  className="pointer fa fa-rss-square fa-lg"
                  title="Open Facebook"
                />
              </a>
              <a
                className="paddingAround hiddenMobile"
                href={linkedInUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon
                  titleId="linkedin"
                  icon={faLinkedin}
                  color={'white'}
                  className="pointer fa fa-rss-square fa-lg"
                  title="Open LinkedIn"
                />
              </a>
              <a href={githubUrl} target="_blank" rel="noreferrer" className="pr-2">
                <FontAwesomeIcon
                  titleId="github"
                  icon={faGithubSquare}
                  color={'white'}
                  className="pointer fa fa-github-square fa-lg -mr-2"
                  title="Open GitHub"
                />
              </a>
            </div>
          );

        var HeaderLink = ({ className }) => (
          <Link
            to={finalLogoLink}
            className={`hover:no-underline flex items-center ${className || ''}`}
          >
            <div className="md:w-64 text-center">
              <img
                className={'hidden md:inline ml-[10px] mr-[10px] w-[200px]'}
                src={logo.image !== '' ? logo.image : logoImg}
                alt={'logo'}
                loading="lazy"
              />
              <img
                className="md:hidden w-[50px]"
                src={logo.mobile !== '' ? logo.mobile : logoImg}
                alt={'logo'}
                loading="lazy"
              />
            </div>
            <Divider />
            <span
              className="inline-block ml-4 md:ml-10 font-semibold text-xs  md:text-base md:uppercase"
              dangerouslySetInnerHTML={{ __html: headerTitle }}
            />
          </Link>
        );

        var SkipToContent = ({ className }) => (
          <a
            href="#content"
            className={`
              ${className || ''}
              relative 
              overflow-hidden
              text-white
              bg-transparent 
              text-xs
              opacity-0 focus:opacity-100
              w-0       focus:w-[unset]
              h-0       focus:h-[unset]
                        focus:px-[1ch]   
            `}
          >
            Skip to Content
          </a>
        );

        return (
          <nav id="navBarDefault" className="bg-[#001934] shadow">
            <div className=" text-white flex flex-row items-center w-full p-4 md:pl-0 h-[80px]">
              <SkipToContent className="-order-1 mx-2" />

              <HeaderLink className="-order-3" />

              <div className="mx-auto -order-2" />

              <LanguageSwitcher className="mr-3 md:mr-0" />

              <Divider className="mx-4" />

              <SocialMediaIcons />

              <div className="block md:hidden">
                <FontAwesomeIcon
                  titleId="bars"
                  icon={faBars}
                  color={'white'}
                  className="pointer fa fa-BARS fa-lg"
                  style={{ cursor: 'pointer' }}
                  title="Open Menu"
                  onClick={() => setNavCollapsed(!navCollapsed)}
                />
              </div>
              <LoginSignup
                className="hidden lg:flex ml-4"
                logoutClassName="text-white hover:text-primary-blue"
                loginClassName="text-white hover:text-primary-blue"
                location={location}
              />

              <SearchBar />
            </div>
            <div
              id="navbar"
              className={
                navCollapsed
                  ? 'hidden border-none'
                  : 'bg-inherit block md:hidden border-none relative z-10 pb-0'
              }
            >
              <Sidebar setNavCollapsed={setNavCollapsed} />
            </div>
          </nav>
        );
      }}
    />
  );
};

const SearchBar = () => {
  const localizePath = useLocalizePath();

  const { t } = useTranslation();

  return (
    <form
      method="get"
      action={localizePath({ path: '/apps/discover' })}
      onSubmit={(event) => {
        // Normally we want to use Gatsby's navigation
        // instead of triggering a page load.
        // However, in the edge-case where
        // the user is already on the discover page
        // but decides to use the global search,
        // navigate() won't update the search,
        // so we just trigger the default form action,
        // reloading the page.
        if (window.location.pathname != localizePath({ path: '/apps/discover/' })) {
          event.preventDefault();
          navigate(
            localizePath({ path: '/apps/discover/?s=' + encodeURIComponent(event.target.s.value) })
          );
        }
      }}
      className="
      flex flex-row-reverse
      [&:hover>input]:w-48
      [&:hover>input]:px-4
      [&:hover>input]:ml-2
      [&:hover>input]:opacity-100
    "
    >
      <input
        type="text"
        name="s"
        placeholder={t('Type Here')}
        className="
          w-0 px-0 opacity-0 
          transition-all
          border-0 
          text-white bg-white/20
          placeholder-opacity-30 placeholder-white 

          focus:ml-2
          focus:w-48
          focus:px-4
          focus:opacity-100
        "
      />
      <button>
        <FontAwesomeIcon
          icon={faSearch}
          color={'white'}
          className="pointer fa fa-lg ml-4 mr-0 transition-all"
          title={t('Search')}
        />
      </button>
    </form>
  );
};

const Divider = ({ className }) => (
  <span className={`divider hidden md:inline-block w-px h-[30px] bg-gray-400 ${className || ''}`} />
);

export default Header;
