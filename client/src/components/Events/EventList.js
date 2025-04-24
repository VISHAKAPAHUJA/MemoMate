import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function EventList() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/events', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(res.data);
    };
    fetchEvents();
  }, []);

  return (
    <div>
      <h2>Your Events</h2>
      <ul>
        {events.map(event => (
          <li key={event._id}>{event.title} - {new Date(event.start).toLocaleString()}</li>
        ))}
      </ul>
    </div>
  );
}