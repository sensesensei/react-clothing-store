import { RiAccountCircleLine } from 'react-icons/ri';
import { NavLink } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import './Menu.css';

function Menu() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isHoveringDropdown, setIsHoveringDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const timerRef = useRef(null);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const startCloseTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 1000);
  };

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

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
          <img src="/Frame 36-Photoroom.png" alt="Логотип" className="logo" />
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

          {isDropdownOpen && (
            <div className="dropdown-menu">
              <NavLink to="/login" className="dropdown-item">
                Войти
              </NavLink>
              <NavLink to="/register" className="dropdown-item">
                Зарегистрироваться
              </NavLink>
            </div>
          )}
        </div>
      </div>

      <div className="menu-links">
        <NavLink to="/catalog">каталог</NavLink>
        <NavLink to="/cart">корзина</NavLink>
        <NavLink to="/about">инфо</NavLink>
        <NavLink to="/contact">контакты</NavLink>
      </div>
    </nav>
  );
}

export default Menu;
