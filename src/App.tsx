import React, { useState, useEffect } from 'react';
import { Button, Fieldset, Frame, List, Modal, TaskBar, TextArea, TitleBar } from '@react95/core';
import { Copy, Help, InfoBubble, Logo, QuestionBubble, Star, Warning } from '@react95/icons';

import './App.css';
import compass from './compass.svg';

type Message = {
  kind: 'success' | 'info' | 'error';
  text: string;
};

const MAGNET_REGEX =
  /magnet:\?xt=urn:[a-z0-9][a-z0-9]?:[a-z0-9]{32,}|magnet:\?xt=urn:btih:[a-z0-9]{40}/gi;

type DesktopIconProps = {
  icon: React.ReactNode;
  label: string;
  onOpen: () => void;
};

const DesktopIcon: React.FC<DesktopIconProps> = ({ icon, label, onOpen }) => {
  const [selected, setSelected] = useState(false);

  return (
    <button
      type="button"
      className={selected ? 'desktop-icon selected' : 'desktop-icon'}
      onClick={() => setSelected(true)}
      onBlur={() => setSelected(false)}
      onDoubleClick={onOpen}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [extractedLinks, setExtractedLinks] = useState<string[]>([]);
  const [mainOpen, setMainOpen] = useState<boolean>(true);
  const [aboutOpen, setAboutOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }
    const savedPreference = localStorage.getItem('darkMode');
    if (savedPreference !== null) {
      return JSON.parse(savedPreference) === true;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Listen for system preference changes
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only automatically switch if user hasn't manually set a preference
      if (localStorage.getItem('darkMode') === null) {
        setDarkMode(e.matches);
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Auto-dismiss message boxes
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  const extractMagnetLinks = () => {
    const matches = inputText.match(MAGNET_REGEX) || [];
    const uniqueLinks = Array.from(new Set(matches.map((link) => link.trim()).filter(Boolean)));

    setExtractedLinks(uniqueLinks);

    if (uniqueLinks.length > 0) {
      setMessage({
        kind: 'success',
        text: `Found ${uniqueLinks.length} magnet link${uniqueLinks.length > 1 ? 's' : ''}`,
      });
    } else {
      setMessage({ kind: 'info', text: 'No magnet links found in the provided text' });
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(extractedLinks.join('\n'));
      setMessage({ kind: 'success', text: 'Copy success' });
    } catch (err) {
      console.error('Failed to copy: ', err);
      setMessage({ kind: 'error', text: 'Failed to copy links' });
    }
  };

  const clearAll = () => {
    setInputText('');
    setExtractedLinks([]);
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      localStorage.setItem('darkMode', JSON.stringify(!prev));
      return !prev;
    });
  };

  const startMenu = (
    <List>
      <List.Item
        icon={<img src={compass} alt="" width={32} height={32} />}
        onClick={() => setMainOpen(true)}
      >
        Magnet Link Extractor
      </List.Item>
      <List.Item
        icon={<Help width={32} height={32} />}
        onClick={() => setAboutOpen(true)}
      >
        About
      </List.Item>
      <List.Divider />
      <List.Item
        icon={<Star width={32} height={32} variant="32x32_4" />}
        onClick={toggleDarkMode}
      >
        {darkMode ? 'Light Mode' : 'Dark Mode'}
      </List.Item>
      <List.Item
        icon={<Logo width={32} height={32} variant="32x32_4" />}
        onClick={() => window.open('https://elstec.cn', '_blank', 'noopener,noreferrer')}
      >
        elstec.cn
      </List.Item>
    </List>
  );

  const windowStyle: React.CSSProperties = {
    top: 72,
    left: 0,
    right: 0,
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: 'calc(100vw - 16px)',
  };

  return (
    <div className={darkMode ? 'desktop r95-dark' : 'desktop'}>
      <div className="desktop-icons">
        <DesktopIcon
          icon={<img src={compass} alt="" width={32} height={32} />}
          label="Magnet Link Extractor"
          onOpen={() => setMainOpen(true)}
        />
        <DesktopIcon
          icon={<Help width={32} height={32} />}
          label="About"
          onOpen={() => setAboutOpen(true)}
        />
      </div>

      {mainOpen && (
        <Modal
          id="magnet-extractor"
          icon={<img src={compass} alt="" width={16} height={16} />}
          title="Magnet Link Extractor"
          w="620px"
          style={windowStyle}
          titleBarOptions={
            <>
              <Modal.Minimize />
              <TitleBar.Close onClick={() => setMainOpen(false)} />
            </>
          }
        >
          <div className="window-body">
            <Frame display="flex" justifyContent="flex-end" mb="$4">
              <Button onClick={toggleDarkMode}>
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </Button>
            </Frame>

            <Fieldset legend="Input Text">
              <TextArea
                w="100%"
                rows={7}
                placeholder="Paste your text here to extract magnet links..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
            </Fieldset>

            <Frame
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              flexWrap="wrap"
              gap="$4"
              my="$4"
            >
              <Frame px="$6" py="$2" boxShadow="$in">
                {extractedLinks.length > 0
                  ? `Found ${extractedLinks.length} magnet link${extractedLinks.length > 1 ? 's' : ''}`
                  : 'No magnet links found'}
              </Frame>

              <Frame display="flex" gap="$4">
                <Button onClick={extractMagnetLinks}>Extract</Button>
                <Button onClick={clearAll}>Clear</Button>
              </Frame>
            </Frame>

            <Fieldset legend="Extracted Magnet Links">
              <TextArea
                w="100%"
                rows={7}
                readOnly
                placeholder="Extracted magnet links will appear here..."
                value={extractedLinks.join('\n')}
              />
            </Fieldset>

            <Frame display="flex" justifyContent="center" mt="$4">
              <Button onClick={copyToClipboard} disabled={extractedLinks.length === 0}>
                <Copy width={16} height={16} variant="16x16_4" style={{ marginRight: 4 }} />
                Copy All Links
              </Button>
            </Frame>

            <Frame display="flex" justifyContent="center" mt="$4">
              <span className="credit">
                Magnet Link Extractor | BY{' '}
                <a href="https://elstec.cn" target="_blank" rel="noopener noreferrer">
                  JCJYXJS
                </a>{' '}
                {new Date().getFullYear()}
              </span>
            </Frame>
          </div>
        </Modal>
      )}

      {aboutOpen && (
        <Modal
          id="about"
          icon={<Help width={16} height={16} variant="16x16_4" />}
          title="About"
          w="380px"
          style={windowStyle}
          buttons={[{ value: 'OK', onClick: () => setAboutOpen(false) }]}
        >
          <div className="window-body">
            <Frame display="flex" alignItems="flex-start" gap="$4" p="$4">
              <Help width={32} height={32} />
              <div>
                <p>
                  <strong>Magnet Link Extractor</strong>
                  <br />
                  Extracts magnet links from any text. Built with{' '}
                  <a href="https://github.com/react95-io/React95" target="_blank" rel="noopener noreferrer">
                    React95
                  </a>
                  .
                </p>
                <p>
                  BY{' '}
                  <a href="https://elstec.cn" target="_blank" rel="noopener noreferrer">
                    JCJYXJS
                  </a>{' '}
                  {new Date().getFullYear()}
                </p>
              </div>
            </Frame>
          </div>
        </Modal>
      )}

      {message && (
        <Modal
          id="message"
          icon={<Help width={16} height={16} variant="16x16_4" />}
          title={
            message.kind === 'error' ? 'Error' : message.kind === 'info' ? 'Information' : 'Success'
          }
          w="360px"
          style={{ ...windowStyle, top: '35%' }}
          buttons={[{ value: 'OK', onClick: () => setMessage(null) }]}
        >
          <div className="window-body">
            <Frame display="flex" alignItems="center" gap="$4" p="$4">
              {message.kind === 'error' ? (
                <Warning width={32} height={32} variant="32x32_4" />
              ) : message.kind === 'info' ? (
                <QuestionBubble width={32} height={32} variant="32x32_32" />
              ) : (
                <InfoBubble width={32} height={32} variant="32x32_4" />
              )}
              <span>{message.text}</span>
            </Frame>
          </div>
        </Modal>
      )}

      <TaskBar list={startMenu} />
    </div>
  );
};

export default App;
