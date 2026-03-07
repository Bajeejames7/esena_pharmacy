import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GlassCard, { validateGlassmorphismProperties, getGlassmorphismValues } from './GlassCard';

/**
 * Property tests for GlassCard glassmorphism styling
 * Implements Requirements 1.1, 1.2, 1.3, 1.4
 * Property 1: Glassmorphism Consistency
 */

describe('GlassCard Property Tests', () => {
  /**
   * Property 1: Glassmorphism Consistency
   * Validates: Requirements 1.1, 1.2, 1.3, 1.4
   * Test that all glass components have required CSS properties
   */
  test('Property 1: All glass components have required glassmorphism properties', () => {
    const testCases = [
      { blur: 'sm', opacity: 0.05 },
      { blur: 'md', opacity: 0.1 },
      { blur: 'lg', opacity: 0.15 },
      { blur: 'md', opacity: 0.2 },
      { blur: 'sm', opacity: 0.08 }
    ];

    testCases.forEach(({ blur, opacity }) => {
      const { container } = render(
        <GlassCard blur={blur} opacity={opacity} data-testid="glass-card">
          Test Content
        </GlassCard>
      );

      const glassCard = container.firstChild;
      
      // Verify glassmorphism values are correctly applied
      const values = getGlassmorphismValues(blur, opacity);
      expect(values.opacity).toBe(opacity);
      expect(values.blur).toContain('backdrop-blur');
      expect(values.backgroundColor).toBe(`rgba(255, 255, 255, ${opacity})`);
      
      // Check CSS classes
      expect(glassCard).toHaveClass('border', 'border-white/20');
      expect(glassCard).toHaveClass('rounded-glass');
      expect(glassCard).toHaveClass('shadow-glass');
      expect(glassCard).toHaveClass('transition-all');
      expect(glassCard).toHaveClass(values.blur);
      
      // Check inline styles
      expect(glassCard).toHaveStyle(`background-color: ${values.backgroundColor}`);
    });
  });

  test('Property 1: Blur intensity validation', () => {
    const blurLevels = ['sm', 'md', 'lg'];
    
    blurLevels.forEach(blur => {
      const { container } = render(
        <GlassCard blur={blur}>Test</GlassCard>
      );
      
      const glassCard = container.firstChild;
      const values = getGlassmorphismValues(blur, 0.1);
      
      expect(glassCard).toHaveClass(values.blur);
    });
  });

  test('Property 1: Opacity range validation', () => {
    const opacityValues = [
      { input: 0, expected: 0 },
      { input: 0.05, expected: 0.05 },
      { input: 0.1, expected: 0.1 },
      { input: 0.15, expected: 0.15 },
      { input: 0.2, expected: 0.2 },
      { input: 0.5, expected: 0.5 },
      { input: 1.0, expected: 1.0 },
      { input: 1.5, expected: 1.0 }, // Should be clamped to 1.0
      { input: -0.1, expected: 0 }   // Should be clamped to 0
    ];
    
    opacityValues.forEach(({ input, expected }) => {
      const { container } = render(
        <GlassCard opacity={input}>Test</GlassCard>
      );
      
      const glassCard = container.firstChild;
      const values = getGlassmorphismValues('md', input);
      
      // Opacity should be clamped between 0 and 1
      expect(values.opacity).toBe(expected);
      expect(values.opacity).toBeGreaterThanOrEqual(0);
      expect(values.opacity).toBeLessThanOrEqual(1);
      
      expect(glassCard).toHaveStyle(`background-color: rgba(255, 255, 255, ${expected})`);
    });
  });

  test('Property 1: Invalid blur values default to medium', () => {
    const invalidBlurValues = ['invalid', 'xl', '', null, undefined];
    
    invalidBlurValues.forEach(blur => {
      const values = getGlassmorphismValues(blur, 0.1);
      expect(values.blur).toBe('backdrop-blur-glass'); // Default to 'md'
    });
  });

  test('Hover effects are applied correctly', () => {
    const { container } = render(
      <GlassCard hover>Test</GlassCard>
    );
    
    const glassCard = container.firstChild;
    expect(glassCard).toHaveClass('hover:shadow-glass-hover');
    expect(glassCard).toHaveClass('hover:bg-white/15');
    expect(glassCard).toHaveClass('cursor-pointer');
  });

  test('Interactive behavior with onClick', () => {
    const handleClick = jest.fn();
    const { container } = render(
      <GlassCard onClick={handleClick}>Test</GlassCard>
    );
    
    const glassCard = container.firstChild;
    
    // Should have interactive attributes
    expect(glassCard).toHaveClass('cursor-pointer');
    expect(glassCard).toHaveAttribute('role', 'button');
    expect(glassCard).toHaveAttribute('tabIndex', '0');
    
    // Should handle click
    fireEvent.click(glassCard);
    expect(handleClick).toHaveBeenCalledTimes(1);
    
    // Should handle keyboard events
    fireEvent.keyDown(glassCard, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(2);
    
    fireEvent.keyDown(glassCard, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(3);
  });

  test('Accessibility attributes are properly set', () => {
    const { container } = render(
      <GlassCard onClick={() => {}}>Test</GlassCard>
    );
    
    const glassCard = container.firstChild;
    expect(glassCard).toHaveAttribute('role', 'button');
    expect(glassCard).toHaveAttribute('tabIndex', '0');
  });

  test('Non-interactive cards do not have button attributes', () => {
    const { container } = render(
      <GlassCard>Test</GlassCard>
    );
    
    const glassCard = container.firstChild;
    expect(glassCard).not.toHaveAttribute('role');
    expect(glassCard).not.toHaveAttribute('tabIndex');
    expect(glassCard).not.toHaveClass('cursor-pointer');
  });
});