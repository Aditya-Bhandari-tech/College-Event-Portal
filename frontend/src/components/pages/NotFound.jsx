import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';

const NotFound = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="not-found-page">
      <div className="container">
        <div className="not-found-content">
          <div className="error-illustration">
            <div className="error-number">404</div>
            <div className="error-icon">🔍</div>
          </div>
          
          <div className="error-text">
            <h1>Page Not Found</h1>
            <p>
              Oops! The page you're looking for seems to have wandered off. 
              Don't worry, even the best explorers get lost sometimes!
            </p>
          </div>
          
          <div className="error-actions">
            <button onClick={goBack} className="btn btn-outline">
              Go Back
            </button>
            
            <Link to={user ? "/dashboard" : "/"} className="btn btn-primary">
              {user ? "Go to Dashboard" : "Go Home"}
            </Link>
          </div>
          
          {user && (
            <div className="quick-links">
              <p>Or try one of these popular sections:</p>
              <div className="links-grid">
                <Link to="/events" className="quick-link">
                  📅 Events
                </Link>
                <Link to="/announcements" className="quick-link">
                  📢 Announcements
                </Link>
                <Link to="/recruitments" className="quick-link">
                  💼 Recruitments
                </Link>
                <Link to="/dashboard" className="quick-link">
                  📊 Dashboard
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .not-found-page {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 80px);
          padding: 2rem 1rem;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }

        .container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .not-found-content {
          max-width: 600px;
          width: 100%;
          margin: 0 auto;
          text-align: center;
          background: white;
          border-radius: 1rem;
          padding: 3rem 2rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }

        .error-illustration {
          position: relative;
          margin-bottom: 2rem;
          height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .error-number {
          font-size: clamp(5rem, 15vw, 8rem);
          font-weight: 900;
          color: #6366f1;
          opacity: 0.15;
          line-height: 1;
          user-select: none;
        }

        .error-icon {
          font-size: clamp(2.5rem, 8vw, 4rem);
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { 
            transform: translate(-50%, -50%) translateY(0px); 
          }
          50% { 
            transform: translate(-50%, -50%) translateY(-10px); 
          }
        }

        .error-text {
          margin-bottom: 2rem;
        }

        .error-text h1 {
          font-size: clamp(1.75rem, 5vw, 2.25rem);
          font-weight: 700;
          margin-bottom: 1rem;
          color: #1f2937;
        }

        .error-text p {
          font-size: clamp(0.95rem, 2.5vw, 1.125rem);
          color: #6b7280;
          line-height: 1.6;
          margin-bottom: 0;
          padding: 0 1rem;
        }

        .error-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          padding: 0 1rem;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
          font-size: clamp(0.875rem, 2vw, 1rem);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 140px;
          white-space: nowrap;
        }

        .btn-primary {
          background-color: #6366f1;
          color: white;
        }

        .btn-primary:hover {
          background-color: #4f46e5;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
        }

        .btn-outline {
          background-color: transparent;
          color: #6366f1;
          border: 2px solid #6366f1;
        }

        .btn-outline:hover {
          background-color: #6366f1;
          color: white;
          transform: translateY(-2px);
        }

        .quick-links {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #e5e7eb;
        }

        .quick-links > p {
          color: #6b7280;
          margin-bottom: 1rem;
          font-weight: 500;
          font-size: clamp(0.875rem, 2vw, 1rem);
        }

        .links-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
          max-width: 400px;
          margin: 0 auto;
        }

        .quick-link {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.875rem 0.75rem;
          background: #f3f4f6;
          border-radius: 0.5rem;
          text-decoration: none;
          color: #1f2937;
          font-size: clamp(0.8125rem, 2vw, 0.875rem);
          font-weight: 500;
          transition: all 0.3s ease;
          gap: 0.5rem;
          text-align: center;
        }

        .quick-link:hover {
          background: #6366f1;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
        }

        /* Tablet styles */
        @media (max-width: 768px) {
          .not-found-page {
            padding: 1.5rem 1rem;
          }

          .not-found-content {
            padding: 2.5rem 1.5rem;
          }

          .error-illustration {
            height: 150px;
            margin-bottom: 1.5rem;
          }

          .error-text {
            margin-bottom: 1.5rem;
          }

          .error-text p {
            padding: 0 0.5rem;
          }

          .error-actions {
            gap: 0.75rem;
            padding: 0 0.5rem;
          }

          .links-grid {
            gap: 0.625rem;
          }
        }

        /* Mobile styles */
        @media (max-width: 480px) {
          .not-found-page {
            padding: 1rem 0.5rem;
            min-height: calc(100vh - 60px);
          }

          .not-found-content {
            padding: 2rem 1rem;
            border-radius: 0.75rem;
          }

          .error-illustration {
            height: 120px;
            margin-bottom: 1.25rem;
          }

          .error-text {
            margin-bottom: 1.25rem;
          }

          .error-text h1 {
            margin-bottom: 0.75rem;
          }

          .error-text p {
            padding: 0;
            line-height: 1.5;
          }

          .error-actions {
            flex-direction: column;
            gap: 0.75rem;
            padding: 0;
            width: 100%;
          }

          .btn {
            width: 100%;
            max-width: 100%;
            min-width: unset;
          }

          .quick-links {
            margin-top: 1.5rem;
            padding-top: 1.5rem;
          }

          .quick-links > p {
            margin-bottom: 0.875rem;
          }

          .links-grid {
            gap: 0.5rem;
            max-width: 100%;
          }

          .quick-link {
            padding: 0.75rem 0.5rem;
            font-size: 0.75rem;
          }
        }

        /* Extra small mobile */
        @media (max-width: 360px) {
          .not-found-content {
            padding: 1.5rem 0.75rem;
          }

          .error-illustration {
            height: 100px;
          }

          .quick-link {
            padding: 0.625rem 0.375rem;
          }
        }
      `}</style>
    </div>
  );
};

export default NotFound;