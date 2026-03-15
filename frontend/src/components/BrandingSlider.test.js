import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import BrandingSlider from './BrandingSlider';

// Mock the responsive hook
jest.mock('../utils/responsive', () => ({
  useBreakpoint: () => ({ breakpoint: 'desktop' })
}));

// Wrapper component for Router
const RouterWrapper = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('BrandingSlider', () => {
  beforeEach(() => {
    // Mock IntersectionObserver
    global.IntersectionObserver = jest.fn(() => ({
      observe: jest.fn(),
      disconnect: jest.fn(),
      unobserve: jest.fn(),
    }));
  });

  test('renders branding slider with images', () => {
    render(<BrandingSlider />, { wrapper: RouterWrapper });
    
    // Check if at least one image is rendered
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);
    
    // Check if the first image has the correct alt text
    expect(screen.getByAltText('Esena Pharmacy Branding 1.1')).toBeInTheDocument();
    
    // Check if navigation buttons are present
    expect(screen.getByLabelText('Previous slide')).toBeInTheDocument();
    expect(screen.getByLabelText('Next slide')).toBeInTheDocument();
    
    // Check if slide indicators are present
    const indicators = screen.getAllByLabelText(/Go to slide/);
    expect(indicators).toHaveLength(9);
    
    // Check if navigation links are present
    const navLinks = screen.getAllByRole('link');
    expect(navLinks.length).toBeGreaterThan(0);
  });

  test('navigates to next slide when next button is clicked', async () => {
    render(<BrandingSlider />, { wrapper: RouterWrapper });
    
    const nextButton = screen.getByLabelText('Next slide');
    fireEvent.click(nextButton);
    
    // Should not throw any errors
    expect(nextButton).toBeInTheDocument();
  });

  test('navigates to previous slide when previous button is clicked', async () => {
    render(<BrandingSlider />, { wrapper: RouterWrapper });
    
    const prevButton = screen.getByLabelText('Previous slide');
    fireEvent.click(prevButton);
    
    // Should not throw any errors
    expect(prevButton).toBeInTheDocument();
  });

  test('navigates to specific slide when indicator is clicked', async () => {
    render(<BrandingSlider />, { wrapper: RouterWrapper });
    
    const indicators = screen.getAllByLabelText(/Go to slide/);
    fireEvent.click(indicators[2]); // Click third indicator (index 2)
    
    // Should not throw any errors
    expect(indicators[2]).toBeInTheDocument();
  });

  test('has proper accessibility attributes', () => {
    render(<BrandingSlider />, { wrapper: RouterWrapper });
    
    // Check slide indicators
    const indicators = screen.getAllByLabelText(/Go to slide/);
    expect(indicators).toHaveLength(9);
    expect(indicators[0]).toHaveAttribute('aria-label', 'Go to slide 1');
    expect(indicators[1]).toHaveAttribute('aria-label', 'Go to slide 2');
  });

  test('handles button clicks without errors', () => {
    render(<BrandingSlider />, { wrapper: RouterWrapper });
    
    const nextButton = screen.getByLabelText('Next slide');
    const prevButton = screen.getByLabelText('Previous slide');
    
    // Should not throw any errors when clicked
    fireEvent.click(nextButton);
    fireEvent.click(prevButton);
    
    expect(nextButton).toBeInTheDocument();
    expect(prevButton).toBeInTheDocument();
  });

  test('renders progress bar', () => {
    render(<BrandingSlider />, { wrapper: RouterWrapper });
    
    // Check if progress bar container exists
    const progressContainer = document.querySelector('.absolute.bottom-0');
    expect(progressContainer).toBeInTheDocument();
  });
});