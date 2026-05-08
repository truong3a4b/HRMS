export function CheckInCard() {

  const handleClick = () => {
    // TODO: navigate to check-in page when implemented
    console.log('Chấm công clicked')
  }

  return (
    <div className="check-in-card" onClick={handleClick} role="button" tabIndex={0}>
      <div className="check-in-card__icon">
        <img
          src="/checkin-icon.png"
          alt=""
          className="check-in-card__icon-img"
        />
      </div>

      <div className="check-in-card__content">
        <h3 className="check-in-card__title">Chấm công</h3>
        <p className="check-in-card__subtitle">để bắt đầu công việc thôi nào!</p>
      </div>
    </div>
  )
}
