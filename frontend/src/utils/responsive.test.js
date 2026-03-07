import { 
  applyResponsiveBreakpoint, 
  calculateResponsiveLayout, 
  validateBreakpointCoverage,
  getBreakpointBoundaries,
  BREAKPOINTS 
} from './responsive';

/**
 * Property tests for responsive breakpoints
 * Implements Requirements 2.1, 2.2, 2.3
 * Property 4: Responsive Breakpoint Coverage
 */

describe('Responsive Breakpoint Property Tests', () => {
  /**
   * Property 4: Responsive Breakpoint Coverage
   * Validates: Requirements 2.1, 2.2, 2.3
   * Test that every window width maps to exactly one breakpoint
   */
  test('Property 4: Every window width maps to exactly one breakpoint', () => {
    // Test a comprehensive range of window widths
    const testWidths = [
      // Mobile range
      320, 480, 600, 767,
      // Tablet range  
      768, 800, 900, 1024,
      // Desktop range
      1025, 1200, 1440, 1920, 2560
    ];

    testWidths.forEach(width => {
      const breakpoint = applyResponsiveBreakpoint(width);
      const isValid = validateBreakpointCoverage(width);
      
      expect(isValid).toBe(true);
      expect(['mobile', 'tablet', 'desktop']).toContain(breakpoint);
    });
  });

  test('Property 4: Breakpoint boundaries are correctly defined', () => {
    const boundaries = getBreakpointBoundaries();
    
    // Test boundary values
    expect(applyResponsiveBreakpoint(767)).toBe('mobile');
    expect(applyResponsiveBreakpoint(768)).toBe('tablet');
    expect(applyResponsiveBreakpoint(1024)).toBe('tablet');
    expect(applyResponsiveBreakpoint(1025)).toBe('desktop');
  });

  test('Property 4: No gaps or overlaps in breakpoint coverage', () => {
    // Test edge cases around boundaries
    const edgeCases = [
      { width: 767, expected: 'mobile' },
      { width: 768, expected: 'tablet' },
      { width: 1024, expected: 'tablet' },
      { width: 1025, expected: 'desktop' }
    ];

    edgeCases.forEach(({ width, expected }) => {
      expect(applyResponsiveBreakpoint(width)).toBe(expected);
      expect(validateBreakpointCoverage(width)).toBe(true);
    });
  });

  test('Layout configuration consistency across breakpoints', () => {
    const breakpoints = ['mobile', 'tablet', 'desktop'];
    
    breakpoints.forEach(breakpoint => {
      const layout = calculateResponsiveLayout(breakpoint);
      
      // Ensure all required properties exist
      expect(layout).toHaveProperty('columns');
      expect(layout).toHaveProperty('padding');
      expect(layout).toHaveProperty('fontSize');
      expect(layout).toHaveProperty('borderRadius');
      expect(layout).toHaveProperty('headerHeight');
      expect(layout).toHaveProperty('sidebarCollapsed');
      expect(layout).toHaveProperty('gridGap');
      
      // Ensure values are reasonable
      expect(layout.columns).toBeGreaterThan(0);
      expect(layout.columns).toBeLessThanOrEqual(3);
    });
  });

  test('Mobile-first responsive progression', () => {
    const mobileLayout = calculateResponsiveLayout('mobile');
    const tabletLayout = calculateResponsiveLayout('tablet');
    const desktopLayout = calculateResponsiveLayout('desktop');
    
    // Columns should increase with screen size
    expect(mobileLayout.columns).toBeLessThanOrEqual(tabletLayout.columns);
    expect(tabletLayout.columns).toBeLessThanOrEqual(desktopLayout.columns);
    
    // Mobile should have collapsed sidebar
    expect(mobileLayout.sidebarCollapsed).toBe(true);
  });
});