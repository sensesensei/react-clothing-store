import { useEffect, useRef, useState } from 'react';
import { RiAccountCircleLine } from 'react-icons/ri';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../features/auth';
import { CartQuantityBadge, useCart } from '../../features/cart';
import './Menu.css';

function Menu() {
  const { totalItems } = useCart();
  const { displayName, isAdmin, isAuthenticated, isLoading, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isHoveringDropdown, setIsHoveringDropdown] = useState(false);
  const [authActionError, setAuthActionError] = useState('');
  const [isSigningOut, setIsSigningOut] = useState(false);
  const dropdownRef = useRef(null);
  const timerRef = useRef(null);

  const toggleDropdown = () => {
    setIsDropdownOpen((currentValue) => !currentValue);
  };

  const startCloseTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 1000);
  };

  const resetTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
    resetTimer();
  };

  async function handleSignOut() {
    try {
      setIsSigningOut(true);
      setAuthActionError('');
      await signOut();
      closeDropdown();
    } catch (error) {
      setAuthActionError(error.message || 'Не удалось выйти из аккаунта.');
    } finally {
      setIsSigningOut(false);
    }
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        resetTimer();
      }
    };

    if (isDropdownOpen && !isHoveringDropdown) {
      startCloseTimer();
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      resetTimer();
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      resetTimer();
    };
  }, [isDropdownOpen, isHoveringDropdown]);

  return (
    <nav className="menu">
      <div className="nav-top">
        <NavLink to="/" end className="logo-link">
          <img src="/Frame 36-Photoroom.png" alt="Логотип Parfum" className="logo" />
        </NavLink>

        <div
          ref={dropdownRef}
          className="account-wrapper"
          onMouseEnter={() => {
            setIsHoveringDropdown(true);
            resetTimer();
          }}
          onMouseLeave={() => {
            setIsHoveringDropdown(false);
            startCloseTimer();
          }}
        >
          <button
            type="button"
            className="account-btn"
            onClick={toggleDropdown}
            aria-label="Открыть меню аккаунта"
          >
            <RiAccountCircleLine size={24} className="account-icon" />
          </button>

          {isDropdownOpen ? (
            <div className="dropdown-menu">
              {isLoading ? (
                <div className="dropdown-note">Проверяем доступ...</div>
              ) : null}

              {isAuthenticated ? (
                <>
                  <div className="dropdown-note">
                    <strong>{isAdmin ? 'Администратор' : 'Без роли администратора'}</strong>
                    <span>{displayName || 'Аккаунт Supabase'}</span>
                  </div>

                  {isAdmin ? (
                    <NavLink to="/admin" className="dropdown-item" onClick={closeDropdown}>
                      Админка
                    </NavLink>
                  ) : null}

                  {!isAdmin ? (
                    <NavLink to="/register" className="dropdown-item" onClick={closeDropdown}>
                      Как получить доступ
                    </NavLink>
                  ) : null}

                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                  >
                    {isSigningOut ? 'Выходим...' : 'Выйти'}
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className="dropdown-item" onClick={closeDropdown}>
                    Вход для администратора
                  </NavLink>
                  <NavLink to="/register" className="dropdown-item" onClick={closeDropdown}>
                    Как получить доступ
                  </NavLink>
                </>
              )}

              {authActionError ? (
                <div className="dropdown-note is-error" role="alert">
                  {authActionError}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="menu-links">
        <NavLink to="/catalog">Каталог</NavLink>
        <NavLink to="/cart" className="menu-cart-link">
          Корзина
          <CartQuantityBadge count={totalItems} />
        </NavLink>
        <NavLink to="/about">О проекте</NavLink>
        <NavLink to="/contact">Контакты</NavLink>
      </div>
    </nav>
  );
}

export default Menu;
