import { ChatsIcon, ContactsIcon, LogoutIcon, PhoneIcon, SettingsIcon } from "../ui/Icons";
import "./NavRail.css";

type NavRailProps = {
  onLogout: () => void;
};

/** Левая панель навигации MAX. Активен только раздел «Чаты» — остальное вне задачи. */
export function NavRail({ onLogout }: NavRailProps) {
  return (
    <nav className="rail" aria-label="Разделы">
      <button type="button" className="rail__item rail__item--active" aria-current="page">
        <ChatsIcon />
        <span>Чаты</span>
      </button>

      <button type="button" className="rail__item" disabled title="Недоступно в демо">
        <ContactsIcon />
        <span>Контакты</span>
      </button>

      <button type="button" className="rail__item" disabled title="Недоступно в демо">
        <PhoneIcon />
        <span>Звонки</span>
      </button>

      <button type="button" className="rail__item" disabled title="Недоступно в демо">
        <SettingsIcon />
        <span>Настройки</span>
      </button>

      <button type="button" className="rail__item rail__item--bottom" onClick={onLogout}>
        <LogoutIcon />
        <span>Выйти</span>
      </button>
    </nav>
  );
}
