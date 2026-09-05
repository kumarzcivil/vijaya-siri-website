import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { fetchMyBookings, type Booking } from "../../../api/bookings";
import { fetchMyNotifications, type Notification } from "../../../api/notifications";
import {
  User,
  MapPin,
  Tag,
  Bell,
  CreditCard,
  ShieldCheck,
  Headphones,
  ArrowRight,
  LogOut,
} from "lucide-react";

function formatINR(amount: number): string {
  return `\u20B9${Math.round(amount).toLocaleString("en-IN")}`;
}

export default function AccountDashboardHome() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    fetchMyBookings().then(setBookings).catch(() => {});
    fetchMyNotifications().then(setNotifications).catch(() => {});
  }, []);

  const upcoming = bookings.filter((b) => b.status === "upcoming").length;
  const totalSpent = bookings.reduce(
    (sum, b) => sum + (b.paymentStatus === "paid" ? b.amount : 0),
    0,
  );
  const unread = notifications.filter((n) => !n.read).length;

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  const tiles = [
    {
      to: "/account/profile",
      title: "Profile",
      text: "Manage your personal information",
      icon: User,
    },
    {
      to: "/account/addresses",
      title: "Addresses",
      text: "Manage your saved addresses",
      icon: MapPin,
    },
    {
      to: "/account/offers",
      title: "Offers & Coupons",
      text: "View available offers",
      icon: Tag,
    },
    {
      to: "/account/notifications",
      title: "Notifications",
      text: "Manage notification preferences",
      icon: Bell,
    },
    {
      to: "/account/payment-preferences",
      title: "Payment Preferences",
      text: "Manage payment methods",
      icon: CreditCard,
    },
    {
      to: "/account/security",
      title: "Security",
      text: "Manage password and security",
      icon: ShieldCheck,
    },
    {
      to: "/account/support",
      title: "Support",
      text: "Get help and support",
      icon: Headphones,
    },
    {
      title: "Sign Out",
      text: "Sign out of your account",
      icon: LogOut,
      onClick: handleSignOut,
    },
  ];

  return (
    <div className="acc-dash-home">
      <div className="acc-dash-stats">
        <div className="acc-stat">
          <span className="acc-stat-label">Total Bookings</span>
          <span className="acc-stat-value">{bookings.length}</span>
        </div>
        <div className="acc-stat">
          <span className="acc-stat-label">Upcoming</span>
          <span className="acc-stat-value">{upcoming}</span>
        </div>
        <div className="acc-stat">
          <span className="acc-stat-label">Paid Amount</span>
          <span className="acc-stat-value">{formatINR(totalSpent)}</span>
        </div>
      </div>

      <div className="acc-tiles">
        {tiles.map((tile) => {
          const Icon = tile.icon;

          const content = (
            <>
              <span className="acc-tile-icon" aria-hidden="true">
                <Icon size={22} strokeWidth={2} />
              </span>

              <span className="acc-tile-body">
                <span className="acc-tile-title">{tile.title}</span>
                <span className="acc-tile-text">{tile.text}</span>
              </span>

              <span className="acc-tile-arrow" aria-hidden="true">
                <ArrowRight size={16} strokeWidth={2.5} />
              </span>
            </>
          );

          if ("onClick" in tile && tile.onClick) {
            return (
              <button
                key={tile.title}
                type="button"
                className="acc-tile acc-tile--btn"
                onClick={tile.onClick}
              >
                {content}
              </button>
            );
          }

          return (
            <Link key={tile.to} to={tile.to} className="acc-tile">
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
