import React, { useState, useEffect } from 'react';
import { Layout, Typography, Input, Button, Card, Space, message, FloatButton, ConfigProvider, theme, Flex } from 'antd';
import { CopyOutlined, SunOutlined, MoonOutlined } from '@ant-design/icons';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [extractedLinks, setExtractedLinks] = useState<string[]>([]);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    // Check system preference for dark mode
    if (typeof window !== 'undefined') {
      const savedPreference = localStorage.getItem('darkMode');
      if (savedPreference !== null) {
        return JSON.parse(savedPreference);
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  
  const [messageApi, contextHolder] = message.useMessage();

  // Function to extract magnet links
  const extractMagnetLinks = () => {
    // Regular expression for magnet links
    const magnetRegex = /magnet:\?xt=urn:[a-z0-9][a-z0-9]?:[a-z0-9]{32,}|magnet:\?xt=urn:btih:[a-z0-9]{40}/gi;
    const matches = inputText.match(magnetRegex) || [];
    
    // Remove duplicates by converting to Set and back to array
    const uniqueLinks = Array.from(new Set(matches.map(link => link.trim()).filter(link => link)));
    
    setExtractedLinks(uniqueLinks);
    
    if (uniqueLinks.length > 0) {
      messageApi.open({
        type: 'success',
        content: `Found ${uniqueLinks.length} magnet link${uniqueLinks.length > 1 ? 's' : ''}`,
      });
    } else {
      messageApi.open({
        type: 'info',
        content: 'No magnet links found in the provided text',
      });
    }
  };

  // Function to copy all links to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(extractedLinks.join('\n'));
      messageApi.open({
        type: 'success',
        content: 'copy success',
      });
    } catch (err) {
      console.error('Failed to copy: ', err);
      messageApi.open({
        type: 'error',
        content: 'Failed to copy links',
      });
    }
  };

  // Function to toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // Update localStorage to indicate user preference was set manually
    localStorage.setItem('darkMode', JSON.stringify(!darkMode));
  };

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only automatically switch if user hasn't manually set a preference in this session
      const userManualPreference = localStorage.getItem('darkMode');
      if (userManualPreference === null) {
        setDarkMode(e.matches);
      }
    };

    // Add listener for system preference changes
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // For older browsers
      (mediaQuery as any).addListener(handleChange);
    }

    // Cleanup listener on unmount
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        (mediaQuery as any).removeListener(handleChange);
      }
    };
  }, []);

  return (
    <ConfigProvider
      theme={{
        algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          fontFamily: 'Cascadia Code, monospace',
        }
      }}
      wave={{ 
        disabled: false 
      }}
    >
      {contextHolder}
      <Layout 
        style={{ 
          minHeight: '100vh', 
          fontFamily: 'Cascadia Code, monospace',
          background: darkMode ? '#141414' : undefined
        }}
      >
        <Header 
          style={{ 
            padding: '16px 10px', 
            height: 'auto', 
            lineHeight: 'normal', 
            background: 'transparent' 
          }}
        >
          <Title 
            style={{ 
              color: 'rgb(24, 144, 255)', 
              textAlign: 'center', 
              margin: 0, 
              fontSize: '20px',
              fontFamily: 'Cascadia Code, monospace'
            }}
          >
            Magnet Link Extractor
          </Title>
        </Header>
        <Content 
          style={{ 
            padding: '16px', 
            maxWidth: '800px', 
            margin: '0 auto', 
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minHeight: 'calc(100vh - 152px)' // Subtract header and footer heights
          }}
        >
          <Card 
            style={{ 
              borderRadius: '8px', 
              boxShadow: darkMode ? '0 4px 12px rgba(255,255,255,0.1)' : '0 4px 12px rgba(0,0,0,0.1)',
              marginBottom: '16px',
              fontFamily: 'Cascadia Code, monospace',
              background: darkMode ? '#1f1f1f' : undefined,
              color: darkMode ? 'rgba(255, 255, 255, 0.85)' : undefined,
              flex: 1
            }}
            bodyStyle={{ 
              padding: '16px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Space direction="vertical" size="middle" style={{ width: '100%', height: '100%' }}>
              <div style={{ flex: 1 }}>
                <Text 
                  strong 
                  style={{ 
                    fontSize: '14px', 
                    display: 'block', 
                    marginBottom: '8px',
                    color: darkMode ? '#177ddc' : '#1890ff',
                    fontFamily: 'Cascadia Code, monospace'
                  }}
                >
                  Input Text:
                </Text>
                <TextArea
                  rows={7}
                  placeholder="Paste your text here to extract magnet links..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  style={{ 
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontFamily: 'Cascadia Code, monospace',
                    background: darkMode ? '#1d1d1d' : undefined,
                    color: darkMode ? 'rgba(255, 255, 255, 0.85)' : undefined,
                    border: darkMode ? '1px solid #424242' : undefined,
                    height: '100%'
                  }}
                />
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <Text 
                  type="secondary" 
                  style={{ 
                    fontSize: '12px',
                    padding: '4px 10px',
                    backgroundColor: darkMode ? '#262626' : '#f6ffed',
                    border: darkMode ? '1px solid #424242' : '1px solid #b7eb8f',
                    borderRadius: '4px',
                    fontFamily: 'Cascadia Code, monospace'
                  }}
                >
                  {extractedLinks.length > 0 
                    ? `Found ${extractedLinks.length} magnet link${extractedLinks.length > 1 ? 's' : ''}` 
                    : 'No magnet links found'}
                </Text>
                
                <Flex gap="small" wrap>
                  <Button 
                    type="primary" 
                    onClick={extractMagnetLinks}
                    style={{ borderRadius: '6px', fontSize: '13px' }}
                    autoInsertSpace={false}
                  >
                    Extract
                  </Button>
                  
                  <Button 
                    onClick={() => {
                      setInputText('');
                      setExtractedLinks([]);
                    }}
                    style={{ borderRadius: '6px', fontSize: '13px' }}
                  >
                    Clear
                  </Button>
                </Flex>
              </div>
              
              <div style={{ flex: 1 }}>
                <Text 
                  strong 
                  style={{ 
                    fontSize: '14px', 
                    display: 'block', 
                    marginBottom: '8px',
                    color: darkMode ? '#49aa19' : '#52c41a',
                    fontFamily: 'Cascadia Code, monospace'
                  }}
                >
                  Extracted Magnet Links:
                </Text>
                <TextArea
                  rows={7}
                  placeholder="Extracted magnet links will appear here..."
                  value={extractedLinks.join('\n')}
                  readOnly
                  style={{ 
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontFamily: 'Cascadia Code, monospace',
                    background: darkMode ? '#1d1d1d' : undefined,
                    color: darkMode ? 'rgba(255, 255, 255, 0.85)' : undefined,
                    border: darkMode ? '1px solid #424242' : undefined,
                    height: '100%'
                  }}
                />
              </div>
              
              <div style={{ textAlign: 'center', marginTop: '12px' }}>
                <Flex gap="small" wrap justify="center">
                  <Button 
                    type="primary" 
                    icon={<CopyOutlined />} 
                    disabled={extractedLinks.length === 0}
                    onClick={copyToClipboard}
                    size="middle"
                    style={{ 
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      fontSize: '13px'
                    }}
                    autoInsertSpace={false}
                  >
                    Copy All Links
                  </Button>
                </Flex>
              </div>
            </Space>
          </Card>
        </Content>
        <Footer 
          style={{ 
            textAlign: 'center', 
            padding: '16px 10px', 
            background: 'transparent', 
            color: darkMode ? 'rgba(255, 255, 255, 0.45)' : '#8c8c8c', 
            fontFamily: 'Cascadia Code, monospace' 
          }}
        >
          Magnet Link Extractor | BY <a href="https://elstec.cn" style={{ color: darkMode ? 'rgba(255, 255, 255, 0.45)' : '#8c8c8c', textDecoration: 'none' }}>JCJYXJS</a> {new Date().getFullYear()} 
        </Footer>
        
        <FloatButton
          icon={darkMode ? <SunOutlined /> : <MoonOutlined />}
          onClick={toggleDarkMode}
          style={{ 
            right: 24,
            bottom: 24,
            background: darkMode ? '#177ddc' : '#1890ff'
          }}
        />
      </Layout>
    </ConfigProvider>
  );
};

export default App;