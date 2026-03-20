import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Supplements = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/products?category=Supplements', { replace: true });
  }, [navigate]);
  return null;
};

export default Supplements;
