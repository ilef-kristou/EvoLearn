import React, { useState } from "react";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import "../../fonts.css";
import "./Statistics.css";
import DepartmentIcon from "../../assets/images/department.png"; 
import GraduateIcon from "../../assets/images/graduate.png";
import LearnIcon from "../../assets/images/learn.png";
import TeacherIcon from "../../assets/images/teacher.png";

const Statistics = () => {
  const { ref, inView } = useInView({ triggerOnce: true });
  const [hasStarted, setHasStarted] = useState(false);

  if (inView && !hasStarted) {
    setHasStarted(true);
  }

  return (
    <div className="statistics" ref={ref}>
      <h2 className="statisticsTitle">FormaCab en chiffres</h2>
      <div className="stats-container">
        <div className="stat-item">
          <div className="stat-icon-container">
            <img src={DepartmentIcon} alt="Départements" className="stat-icon" />
          </div>
          <h3>
            {hasStarted ? (
              <CountUp start={0} end={21} duration={4} />
            ) : (
              "0"
            )}
          </h3>
          <p>Départements couverts</p>
        </div>
        
        <div className="stat-item">
          <div className="stat-icon-container">
            <img src={GraduateIcon} alt="Apprenants" className="stat-icon" />
          </div>
          <h3>
            {hasStarted ? (
              <CountUp start={0} end={380} duration={4} />
            ) : (
              "0"
            )}
          </h3>
          <p>Apprenants formés</p>
        </div>
        
        <div className="stat-item">
          <div className="stat-icon-container">
            <img src={LearnIcon} alt="Formations" className="stat-icon" />
          </div>
          <h3>
            {hasStarted ? (
              <CountUp start={0} end={3000} duration={4} />
            ) : (
              "0"
            )}
          </h3>
          <p>Heures de formation</p>
        </div>
        
        <div className="stat-item">
          <div className="stat-icon-container">
            <img src={TeacherIcon} alt="Formateurs" className="stat-icon" />
          </div>
          <h3>
            {hasStarted ? <CountUp start={0} end={34} duration={4} /> : "0"}
          </h3>
          <p>Formateurs experts</p>
        </div>
      </div>
    </div>
  );
};

export default Statistics;