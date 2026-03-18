import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Personal Care page - redirects to Products page with PersonalCare category pre-selected
 */
const PersonalCare = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/products?category=PersonalCare', { replace: true });
  }, [navigate]);

  return null;
};

export default PersonalCare;
