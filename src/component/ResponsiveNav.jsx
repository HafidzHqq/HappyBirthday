import React, { useState, useEffect } from 'react';
import BubbleMenu from './BubbleMenu';

export default function ResponsiveNav() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const menuItems = [
    {
      label: 'Home',
      href: 'index.html',
      ariaLabel: 'Home',
      rotation: 0,
      hoverStyles: { bgColor: '#667eea', textColor: '#ffffff' }
    },
    {
      label: 'Flex',
      href: 'main.html',
      ariaLabel: 'Flex Layout',
      rotation: 0,
      hoverStyles: { bgColor: '#f093fb', textColor: '#ffffff' }
    },
    {
      label: 'Grid',
      href: 'peler.html',
      ariaLabel: 'Grid Layout',
      rotation: 0,
      hoverStyles: { bgColor: '#4facfe', textColor: '#ffffff' }
    }
  ];

  if (!isMobile) {
    return null; // Navbar HTML biasa akan muncul
  }

  return (
    <BubbleMenu
      logo="QQ"
      menuBg="#1f2937"
      menuContentColor="#ffffff"
      useFixedPosition={true}
      items={menuItems}
      menuAriaLabel="Toggle navigation menu"
    />
  );
}
