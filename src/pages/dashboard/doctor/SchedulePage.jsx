import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const SchedulePage = () => {
  const [weeklySchedule, setWeeklySchedule] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("week");

  const doctorId = localStorage.getItem("doctorId");
  const hospitalId = localStorage.getItem("hospitalId");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1️⃣ Get Doctor Calendar
        const calendarRes = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/calendar/doctor/${doctorId}`
        );

        if (Array.isArray(calendarRes.data)) {
          const schedule = calendarRes.data.flatMap((hospital) =>
            hospital.days.map((day) => ({
              day: dayjs(day.date).format("dddd"),
              time:
                day.doctor?.availableSlots?.length > 0
                  ? `${day.doctor.availableSlots[0]} – ${
                      day.doctor.availableSlots[
                        day.doctor.availableSlots.length - 1
                      ]
                    }`
                  : "Off",
            }))
          );
          setWeeklySchedule(schedule);

          // Prepare events for the full calendar
          const events = [];
          calendarRes.data.forEach((hospital) => {
            hospital.days.forEach((day) => {
              const date = day.date;
              // Available slots = green
              day.doctor?.availableSlots?.forEach((slot) => {
                const [hour, minute] = slot.split(":");
                const startDate = new Date(date);
                startDate.setHours(parseInt(hour), parseInt(minute), 0);
                const endDate = new Date(startDate);
                endDate.setMinutes(endDate.getMinutes() + 30);
                events.push({
                  title: `Available`,
                  start: startDate,
                  end: endDate,
                  type: "available",
                });
              });
              // Booked slots = red
              day.doctor?.bookedSlots?.forEach((slot) => {
                const [hour, minute] = slot.split(":");
                const startDate = new Date(date);
                startDate.setHours(parseInt(hour), parseInt(minute), 0);
                const endDate = new Date(startDate);
                endDate.setMinutes(endDate.getMinutes() + 30);
                events.push({
                  title: `Booked`,
                  start: startDate,
                  end: endDate,
                  type: "booked",
                });
              });
            });
          });
          setCalendarEvents(events);
        }

        // 2️⃣ Get Upcoming Appointments
        const appointmentsRes = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/appointments/doctor/${doctorId}`
        );

        if (Array.isArray(appointmentsRes.data)) {
          const upcoming = appointmentsRes.data
            .filter(
              (appt) =>
                dayjs(appt.appointment_date).isAfter(dayjs()) &&
                appt.status !== "Cancelled"
            )
            .map((appt) => ({
              patient: `${appt.patient_id?.first_name || ""} ${
                appt.patient_id?.last_name || ""
              }`,
              date: dayjs(appt.appointment_date).format("YYYY-MM-DD"),
              time: appt.time_slot,
            }));

          setUpcomingAppointments(upcoming);
        }
      } catch (err) {
        console.error("Failed to load schedule data", err);
      } finally {
        setLoading(false);
      }
    };

    if (doctorId && hospitalId) {
      fetchData();
    }
  }, [doctorId, hospitalId]);

  // Custom event styling
  const eventStyleGetter = (event) => {
    const style = {
      backgroundColor: event.type === "available" ? "#16a34a" : "#dc2626",
      borderRadius: "6px",
      opacity: 0.9,
      color: "white",
      border: "none",
      display: "block",
    };
    return { style };
  };

  if (loading) {
    return <p className="p-6">Loading schedule...</p>;
  }

  return (
    <main className="flex-1 min-h-screen px-6 py-8">
      <h1 className="text-2xl text-teal-600 font-bold mt-0 mb-6 bg-white p-4">
        Doctor Schedule
      </h1>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Weekly Schedule */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4 text-teal-600">
            Weekly Availability
          </h2>
          {weeklySchedule.length > 0 ? (
            <ul className="space-y-2">
              {weeklySchedule.map((item, i) => (
                <li
                  key={i}
                  className="flex justify-between text-gray-700 border-b pb-1"
                >
                  <span>{item.day}</span>
                  <span>{item.time}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No availability found.</p>
          )}
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl text-teal-600 font-semibold mb-4">
            Upcoming Appointments
          </h2>
          {upcomingAppointments.length > 0 ? (
            <ul className="divide-y">
              {upcomingAppointments.map((appt, i) => (
                <li
                  key={i}
                  className="py-2 flex justify-between items-center text-gray-700"
                >
                  <div>
                    <p className="font-medium">{appt.patient}</p>
                    <p className="text-sm text-gray-500">{appt.date}</p>
                  </div>
                  <span>{appt.time}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No upcoming appointments.</p>
          )}
        </div>
      </div>

      {/* Full Calendar */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4 text-teal-600">
          Full Calendar
        </h2>
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          eventPropGetter={eventStyleGetter}
          views={["month", "week", "day"]}
          date={currentDate} // controlled date
          view={currentView} // controlled view
          onNavigate={(date) => setCurrentDate(date)} // navigation handler
          onView={(view) => setCurrentView(view)} // view change handler
        />
      </div>
    </main>
  );
};

export default SchedulePage;
