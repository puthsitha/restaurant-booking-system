import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { RESERVATION_STATUS_TONE } from "@/lib/reservations/statusTone";
import type { Reservation } from "@/lib/reservations/types";
import { theme } from "@/lib/theme";

interface BookingDetailModalProps {
  reservation: Reservation | null;
  onClose: () => void;
  // Owner/admin views show the restaurant name; a restaurant's own booking
  // list doesn't need to repeat it, so this stays optional.
  showRestaurant?: boolean;
}

function money(amount: string): string {
  const usd = Number(amount);
  return `$${usd.toFixed(2)} · ៛${Math.round(usd * theme.currency.usdToKhrRate).toLocaleString()}`;
}

// Read-only "everything about this booking" panel shared by the owner and
// admin bookings pages — status changes stay in the row actions, this modal
// is purely for inspecting the full record.
export function BookingDetailModal({
  reservation,
  onClose,
  showRestaurant = true,
}: BookingDetailModalProps) {
  return (
    <Modal open={reservation !== null} onClose={onClose} title="Booking details">
      {reservation && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar name={reservation.user.name} />
              <div>
                <p className="font-bold text-ink">{reservation.user.name}</p>
                <p className="text-xs text-muted">
                  {reservation.user.phone ?? reservation.user.email ?? "—"}
                </p>
              </div>
            </div>
            <StatusBadge tone={RESERVATION_STATUS_TONE[reservation.status]}>
              {reservation.status}
            </StatusBadge>
          </div>

          <div className="rounded-xl bg-bg p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Confirmation code
            </p>
            <p className="disp mt-1 text-xl font-extrabold text-ink">
              {reservation.confirmationCode}
            </p>
          </div>

          <dl className="space-y-2.5 text-sm">
            {showRestaurant && <Row label="Restaurant" value={reservation.restaurant.name} />}
            <Row
              label="Date & time"
              value={`${reservation.date.slice(0, 10)} at ${reservation.time}`}
            />
            <Row label="Party size" value={`${reservation.partySize} guests`} />
            <Row label="Seating" value={reservation.seatingPreference} />
            <Row
              label="Table"
              value={
                reservation.table
                  ? `${reservation.table.tableNumber}${reservation.table.zone ? ` · ${reservation.table.zone}` : ""}`
                  : "Not assigned"
              }
            />
            <Row
              label="Deposit"
              value={
                Number(reservation.depositAmount) > 0
                  ? `${money(reservation.depositAmount)} · ${reservation.depositPaid ? "Paid" : "Unpaid"}`
                  : "Not required"
              }
            />
            <Row label="Booked" value={new Date(reservation.createdAt).toLocaleString()} />
          </dl>

          {reservation.specialRequests && (
            <div>
              <p className="text-xs font-bold text-label">Special requests</p>
              <p className="mt-1.5 rounded-xl bg-bg p-3 text-sm text-ink">
                {reservation.specialRequests}
              </p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-semibold text-ink">{value}</dd>
    </div>
  );
}
