import React from 'react';
import Sidebar from './Sidebar';
import './Calendar.css';
import './styles.css';

const Calendar = ({ onNavigate }) => {
  return (
    <div className="body-with-right-side-primary-nav-expanded full-width-context-user_19897">
      
      {/* Sidebar Navigation */}
      <Sidebar page="calendar" onNavigate={onNavigate} />

      <div id="main-content-wrapper">
        <header className="page-header">
            <h1>Calendar</h1> 
        </header>

        <div className="main-content-area">
            <div className="calendar-container">
                <div className="calendar-header">
                    <h2>November 2025</h2>
                    <div>
                        <button className="dashboard-button" style={{padding: '5px 10px', marginRight: '5px'}}>Prev</button>
                        <button className="dashboard-button" style={{padding: '5px 10px'}}>Next</button>
                    </div>
                </div>

                <div className="calendar-grid">
                    {/* Day Headers */}
                    <div className="calendar-day-header">Sun</div>
                    <div className="calendar-day-header">Mon</div>
                    <div className="calendar-day-header">Tue</div>
                    <div className="calendar-day-header">Wed</div>
                    <div className="calendar-day-header">Thu</div>
                    <div className="calendar-day-header">Fri</div>
                    <div className="calendar-day-header">Sat</div>

                    {/* Empty slots for previous month */}
                    <div className="calendar-cell" style={{backgroundColor: '#f9f9f9'}}></div>
                    <div className="calendar-cell" style={{backgroundColor: '#f9f9f9'}}></div>
                    <div className="calendar-cell" style={{backgroundColor: '#f9f9f9'}}></div>
                    <div className="calendar-cell" style={{backgroundColor: '#f9f9f9'}}></div>
                    <div className="calendar-cell" style={{backgroundColor: '#f9f9f9'}}></div>
                    <div className="calendar-cell" style={{backgroundColor: '#f9f9f9'}}></div>

                    {/* Days 1-30 (Simplified) */}
                    <div className="calendar-cell"><span className="day-number">1</span></div>
                    <div className="calendar-cell"><span className="day-number">2</span></div>
                    <div className="calendar-cell"><span className="day-number">3</span></div>
                    <div className="calendar-cell"><span className="day-number">4</span></div>
                    
                    <div className="calendar-cell">
                        <span className="day-number">5</span>
                        <div className="calendar-event event-blue">CS 35L Quiz</div>
                    </div>
                    
                    <div className="calendar-cell"><span className="day-number">6</span></div>
                    <div className="calendar-cell"><span className="day-number">7</span></div>
                    <div className="calendar-cell"><span className="day-number">8</span></div>
                    <div className="calendar-cell"><span className="day-number">9</span></div>
                    <div className="calendar-cell"><span className="day-number">10</span></div>
                    <div className="calendar-cell"><span className="day-number">11</span></div>
                    <div className="calendar-cell"><span className="day-number">12</span></div>
                    <div className="calendar-cell"><span className="day-number">13</span></div>
                    <div className="calendar-cell"><span className="day-number">14</span></div>
                    <div className="calendar-cell"><span className="day-number">15</span></div>
                    <div className="calendar-cell"><span className="day-number">16</span></div>
                    <div className="calendar-cell"><span className="day-number">17</span></div>
                    <div className="calendar-cell"><span className="day-number">18</span></div>
                    <div className="calendar-cell"><span className="day-number">19</span></div>
                    
                    <div className="calendar-cell">
                        <span className="day-number">20</span>
                        <div className="calendar-event event-red">Math 61 Midterm</div>
                    </div>
                    
                    <div className="calendar-cell"><span className="day-number">21</span></div>
                    <div className="calendar-cell"><span className="day-number">22</span></div>
                    <div className="calendar-cell"><span className="day-number">23</span></div>
                    <div className="calendar-cell"><span className="day-number">24</span></div>
                    <div className="calendar-cell"><span className="day-number">25</span></div>
                    <div className="calendar-cell"><span className="day-number">26</span></div>
                    <div className="calendar-cell"><span className="day-number">27</span></div>
                    
                    <div className="calendar-cell">
                        <span className="day-number">28</span>
                        <div className="calendar-event event-green">Project Report Due</div>
                    </div>
                    
                    <div className="calendar-cell"><span className="day-number">29</span></div>
                    <div className="calendar-cell"><span className="day-number">30</span></div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
