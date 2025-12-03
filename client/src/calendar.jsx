import React, { useState, useEffect } from 'react';
import Sidebar from './sidebar.jsx';
import './calendar.css';
import './styles.css';

const Calendar = ({ onNavigate, onLogout }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isAllEventsModalOpen, setIsAllEventsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [allEventsForDay, setAllEventsForDay] = useState([]);
    const [newEvent, setNewEvent] = useState({ title: '', time: '09:00', color: '#007bff' });
    const [loading, setLoading] = useState(true);

    // Colors for the picker
    const colors = ['#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8', '#6610f2'];

    useEffect(() => {
        fetchEventsAndAssignments();
    }, []);

    const fetchEventsAndAssignments = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const sessionId = localStorage.getItem('sessionId');

            const headers = {
                'Content-Type': 'application/json',
            };

            if (token) headers['x-auth-token'] = token;
            if (sessionId) headers['x-session-id'] = sessionId;

            // Fetch personal events
            const eventsRes = await fetch('http://localhost:3001/api/event', { headers });
            const eventsData = await eventsRes.json();

            // Fetch assignments
            const assignmentsRes = await fetch('http://localhost:3001/api/assignment/my-assignments', { headers });
            const assignmentsData = await assignmentsRes.json();

            let allEvents = [];

            if (Array.isArray(eventsData)) {
                allEvents = [...allEvents, ...eventsData.map(e => ({
                    ...e,
                    date: new Date(e.date),
                    time: e.time || '00:00',
                    type: 'personal'
                }))];
            }

            if (assignmentsData.success && Array.isArray(assignmentsData.data)) {
                allEvents = [...allEvents, ...assignmentsData.data.map(a => ({
                    _id: a._id,
                    title: `${a.class.name}: ${a.title}`,
                    date: new Date(a.dueDate),
                    time: '23:59', // Assignments default to end of day
                    color: '#28a745', // Green for assignments
                    type: 'assignment',
                    description: a.description,
                    pointsPossible: a.pointsPossible
                }))];
            }

            setEvents(allEvents);
        } catch (error) {
            console.error('Error fetching calendar data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleCreateEventClick = () => {
        setSelectedDate(new Date());
        setNewEvent({ title: '', time: '09:00', color: '#007bff' });
        setIsCreateModalOpen(true);
    };

    const handleEventClick = (e, event) => {
        e.stopPropagation();
        setSelectedEvent(event);
        setIsDetailModalOpen(true);
    };

    const handleShowAllEvents = (e, day) => {
        e.stopPropagation();
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dayEvents = events.filter(ev =>
            ev.date.getDate() === day &&
            ev.date.getMonth() === currentDate.getMonth() &&
            ev.date.getFullYear() === currentDate.getFullYear()
        ).sort((a, b) => a.time.localeCompare(b.time));

        setAllEventsForDay(dayEvents);
        setSelectedDate(date);
        setIsAllEventsModalOpen(true);
    };

    const handleAddEvent = async () => {
        if (!newEvent.title) return;

        try {
            const token = localStorage.getItem('token');
            const sessionId = localStorage.getItem('sessionId');

            const headers = {
                'Content-Type': 'application/json',
            };

            if (token) headers['x-auth-token'] = token;
            if (sessionId) headers['x-session-id'] = sessionId;

            const res = await fetch('http://localhost:3001/api/event', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    title: newEvent.title,
                    date: selectedDate,
                    time: newEvent.time,
                    color: newEvent.color
                })
            });

            if (res.ok) {
                setIsCreateModalOpen(false);
                fetchEventsAndAssignments(); // Refresh events
            }
        } catch (error) {
            console.error('Error adding event:', error);
        }
    };

    const handleDeleteEvent = async (eventId) => {
        if (!window.confirm('Are you sure you want to delete this event?')) return;

        try {
            const token = localStorage.getItem('token');
            const sessionId = localStorage.getItem('sessionId');

            const headers = {
                'Content-Type': 'application/json',
            };

            if (token) headers['x-auth-token'] = token;
            if (sessionId) headers['x-session-id'] = sessionId;

            const res = await fetch(`http://localhost:3001/api/event/${eventId}`, {
                method: 'DELETE',
                headers
            });

            if (res.ok) {
                setIsDetailModalOpen(false);
                fetchEventsAndAssignments(); // Refresh events
            }
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    // Convert time string (HH:mm) to percentage position (0-100)
    // Maps waking hours (6am-11:59pm) to vertical space for better visibility
    // Caps at 80% to prevent text cutoff at bottom
    const timeToPercentage = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes;

        // Map typical waking hours to use most of the space
        const startOfDay = 6 * 60;   // 6am -> 5%
        const endOfDay = 23 * 60 + 59; // 11:59pm -> 80%

        if (totalMinutes < startOfDay) {
            // Early morning (midnight-6am) -> top 5%
            return (totalMinutes / startOfDay) * 5;
        } else if (totalMinutes >= endOfDay) {
            // Late assignments (11:59pm) -> 80% (bottom but fully readable)
            return 80;
        } else {
            // Normal waking hours (6am-11:59pm) -> 5% to 80%
            return 5 + ((totalMinutes - startOfDay) / (endOfDay - startOfDay)) * 75;
        }
    };

    // Calendar rendering logic
    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const renderCalendarCells = () => {
        const cells = [];

        // Empty cells for previous month
        for (let i = 0; i < firstDay; i++) {
            cells.push(<div key={`empty-${i}`} className="calendar-cell" style={{ backgroundColor: '#f9f9f9' }}></div>);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dayEvents = events.filter(e =>
                e.date.getDate() === day &&
                e.date.getMonth() === currentDate.getMonth() &&
                e.date.getFullYear() === currentDate.getFullYear()
            ).sort((a, b) => a.time.localeCompare(b.time)); // Sort by time

            const visibleEvents = dayEvents.slice(0, 3);
            const hasMoreEvents = dayEvents.length > 3;

            cells.push(
                <div key={`day-${day}`} className="calendar-cell">
                    <span className="day-number">{day}</span>
                    <div className="events-container">
                        {visibleEvents.map((event, index) => {
                            const topPosition = timeToPercentage(event.time);
                            return (
                                <div
                                    key={index}
                                    className="calendar-event"
                                    style={{
                                        backgroundColor: event.color,
                                        top: `${topPosition}%`
                                    }}
                                    title={`${event.time} - ${event.title}`}
                                    onClick={(e) => handleEventClick(e, event)}
                                >
                                    <span className="event-title">{event.title}</span>
                                </div>
                            );
                        })}
                        {hasMoreEvents && (
                            <div
                                className="more-events"
                                onClick={(e) => handleShowAllEvents(e, day)}
                            >
                                +{dayEvents.length - 3} more
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return cells;
    };

    return (
        <div className="body-with-right-side-primary-nav-expanded full-width-context-user_19897">
            <Sidebar page="calendar" onNavigate={onNavigate} onLogout={onLogout} />

            <div id="main-content-wrapper">
                <header className="page-header">
                    <h1>Calendar</h1>
                    <button className="dashboard-button" onClick={handleCreateEventClick}>
                        + Create Event
                    </button>
                </header>

                <div className="main-content-area">
                    <div className="calendar-container">
                        <div className="calendar-header">
                            <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                            <div>
                                <button className="dashboard-button" onClick={handlePrevMonth} style={{ padding: '5px 10px', marginRight: '5px' }}>Prev</button>
                                <button className="dashboard-button" onClick={handleNextMonth} style={{ padding: '5px 10px' }}>Next</button>
                            </div>
                        </div>

                        <div className="calendar-grid">
                            <div className="calendar-day-header">Sun</div>
                            <div className="calendar-day-header">Mon</div>
                            <div className="calendar-day-header">Tue</div>
                            <div className="calendar-day-header">Wed</div>
                            <div className="calendar-day-header">Thu</div>
                            <div className="calendar-day-header">Fri</div>
                            <div className="calendar-day-header">Sat</div>
                            {renderCalendarCells()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Event Modal */}
            {isCreateModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Create Event</h3>
                            <button className="close-button" onClick={() => setIsCreateModalOpen(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Date</label>
                                <input
                                    type="date"
                                    value={selectedDate?.toISOString().split('T')[0]}
                                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                                />
                            </div>
                            <div className="form-group">
                                <label>Time</label>
                                <input
                                    type="time"
                                    value={newEvent.time}
                                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Event Title</label>
                                <input
                                    type="text"
                                    value={newEvent.title}
                                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                    placeholder="Enter event title"
                                    autoFocus
                                />
                            </div>
                            <div className="form-group">
                                <label>Color</label>
                                <div className="color-picker">
                                    {colors.map(color => (
                                        <div
                                            key={color}
                                            className={`color-option ${newEvent.color === color ? 'selected' : ''}`}
                                            style={{ backgroundColor: color }}
                                            onClick={() => setNewEvent({ ...newEvent, color })}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
                            <button className="btn-primary" onClick={handleAddEvent}>Create Event</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Event Detail Modal */}
            {isDetailModalOpen && selectedEvent && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{selectedEvent.title}</h3>
                            <button className="close-button" onClick={() => setIsDetailModalOpen(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="event-detail">
                                <div className="detail-row">
                                    <strong>Date:</strong> {selectedEvent.date.toDateString()}
                                </div>
                                <div className="detail-row">
                                    <strong>Time:</strong> {selectedEvent.time}
                                </div>
                                <div className="detail-row">
                                    <strong>Type:</strong> {selectedEvent.type === 'assignment' ? 'Assignment' : 'Personal Event'}
                                </div>
                                {selectedEvent.description && (
                                    <div className="detail-row">
                                        <strong>Description:</strong> {selectedEvent.description}
                                    </div>
                                )}
                                {selectedEvent.pointsPossible !== undefined && (
                                    <div className="detail-row">
                                        <strong>Points:</strong> {selectedEvent.pointsPossible}
                                    </div>
                                )}
                                <div className="detail-row">
                                    <div
                                        className="color-badge"
                                        style={{
                                            backgroundColor: selectedEvent.color,
                                            width: '30px',
                                            height: '30px',
                                            borderRadius: '5px',
                                            display: 'inline-block'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-actions">
                            {selectedEvent.type === 'personal' && (
                                <button
                                    className="btn-danger"
                                    onClick={() => handleDeleteEvent(selectedEvent._id)}
                                >
                                    Delete Event
                                </button>
                            )}
                            <button className="btn-secondary" onClick={() => setIsDetailModalOpen(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* All Events Modal */}
            {isAllEventsModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>All Events - {selectedDate?.toDateString()}</h3>
                            <button className="close-button" onClick={() => setIsAllEventsModalOpen(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="all-events-list">
                                {allEventsForDay.map((event, index) => (
                                    <div
                                        key={index}
                                        className="event-list-item"
                                        onClick={() => {
                                            setIsAllEventsModalOpen(false);
                                            setSelectedEvent(event);
                                            setIsDetailModalOpen(true);
                                        }}
                                        style={{
                                            borderLeft: `4px solid ${event.color}`,
                                            padding: '10px',
                                            marginBottom: '8px',
                                            cursor: 'pointer',
                                            backgroundColor: '#f8f9fa',
                                            borderRadius: '4px'
                                        }}
                                    >
                                        <div style={{ fontWeight: 'bold' }}>{event.time} - {event.title}</div>
                                        <div style={{ fontSize: '0.9em', color: '#666' }}>
                                            {event.type === 'assignment' ? 'Assignment' : 'Personal Event'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setIsAllEventsModalOpen(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Calendar;
