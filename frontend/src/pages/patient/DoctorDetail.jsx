import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Spinner from '../../components/Spinner';
import SlotGrid from '../../components/SlotGrid';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useNotification } from '../../context/NotificationContext';
import { fetchDoctor, fetchDoctorSlots } from '../../services/doctor.service';
import { bookAppointment } from '../../services/appointment.service';
import { formatDate, formatTime, todayISODate } from '../../utils/format';

export default function DoctorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useNotification();

  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState(todayISODate());
  const [slotData, setSlotData] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    fetchDoctor(id)
      .then(setDoctor)
      .catch((err) => setError(err.message));
  }, [id]);

  useEffect(() => {
    if (!date) return;
    setLoadingSlots(true);
    setSelectedSlot(null);
    fetchDoctorSlots(id, date)
      .then(setSlotData)
      .catch((err) => setError(err.message))
      .finally(() => setLoadingSlots(false));
  }, [id, date]);

  const handleBook = async () => {
    setBooking(true);
    try {
      await bookAppointment({ doctorId: id, appointmentDate: date, startTime: selectedSlot.startTime });
      notify('Appointment booked successfully.');
      navigate('/patient/appointments');
    } catch (err) {
      notify(err.message, 'error');
      setSelectedSlot(null);
    } finally {
      setBooking(false);
    }
  };

  if (error) return <p className="form-error">{error}</p>;
  if (!doctor) return <Spinner />;

  return (
    <div>
      <div className="doctor-detail-header">
        <span className="profile-avatar">{doctor.name.replace('Dr. ', '').charAt(0).toUpperCase()}</span>
        <div>
          <h1 className="page-title doctor-detail-title">{doctor.name}</h1>
          <p className="doctor-specialization">{doctor.specialization}</p>
          <p className="doctor-meta">{doctor.email} &bull; {doctor.phone}</p>
        </div>
      </div>

      <div className="form-card">
        <label className="field">
          <span>Select Date</span>
          <input type="date" min={todayISODate()} value={date} onChange={(e) => setDate(e.target.value)} />
        </label>

        {loadingSlots && <Spinner label="Loading slots..." />}

        {!loadingSlots && slotData && (
          <>
            <div className="chip-row">
              {slotData.availabilityPeriods?.length > 0 ? (
                slotData.availabilityPeriods.map((p) => (
                  <span key={p.startTime} className="chip chip-available">
                    {formatTime(p.startTime)} - {formatTime(p.endTime)}
                  </span>
                ))
              ) : (
                <span className="empty-state-message">Doctor has no availability set for this date.</span>
              )}
              {slotData.breaks?.map((b) => (
                <span key={b.startTime} className="chip chip-break">
                  Break {formatTime(b.startTime)} - {formatTime(b.endTime)}
                </span>
              ))}
            </div>

            <SlotGrid slots={slotData.slots} selected={selectedSlot?.startTime} onSelect={setSelectedSlot} />

            {slotData.slots.length > 0 && (
              <div className="slot-legend">
                <span><i className="legend-dot legend-dot-available" />Available</span>
                <span><i className="legend-dot legend-dot-booked" />Booked</span>
                <span><i className="legend-dot legend-dot-break" />Break</span>
                <span><i className="legend-dot legend-dot-past" />Past</span>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        open={!!selectedSlot}
        title="Confirm Booking"
        message={
          selectedSlot
            ? `Book ${doctor.name} on ${formatDate(date)} at ${formatTime(selectedSlot.startTime)} - ${formatTime(selectedSlot.endTime)}?`
            : ''
        }
        confirmLabel={booking ? 'Booking...' : 'Confirm Booking'}
        onCancel={() => setSelectedSlot(null)}
        onConfirm={handleBook}
      />
    </div>
  );
}
