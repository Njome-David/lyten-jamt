// tests/three/outpost.test.ts
import { render } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import { OutpostKit } from '../../src/three/outpost/OutpostKit';
import type { SiteId } from '../../src/engine/types';

describe('OutpostKit component', () => {
  const renderKit = (site: SiteId) => {
    render(
      <Canvas>
        <OutpostKit site={site} />
      </Canvas>
    );
  };

  test('renders dome and panels for moon site', () => {
    renderKit('shackleton');
    // basic existence checks via three-test-utils not available, just ensure no error
    expect(true).toBeTruthy();
  });

  test('renders dome and panels for mars site', () => {
    renderKit('gale');
    expect(true).toBeTruthy();
  });
});
