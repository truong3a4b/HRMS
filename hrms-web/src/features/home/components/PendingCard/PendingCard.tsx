interface PendingCardProps {
  count?: number
  onClick?: () => void
}

export function PendingCard({ count = 0, onClick }: PendingCardProps) {
  const hasPending = count > 0
  const message = hasPending
    ? `${count} yêu cầu chờ duyệt`
    : 'Không có yêu cầu chờ duyệt'

  return (
    <div className="pending-card" onClick={onClick} role="button" tabIndex={0}>
      <div className="pending-card__glass">
        <div className="pending-card__inner">
          <div className="pending-card__icon">
            <img
              src="/validation-icon.png"
              alt=""
              className="pending-card__icon-img"
            />
          </div>

          <span className="pending-card__text">{message}</span>
        </div>
      </div>
    </div>
  )
}
