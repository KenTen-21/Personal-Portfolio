import React, { useState } from 'react';
import './PortfolioLayout.css';

interface Project {
  id: number;
  name: string;
  description: string;
  link?: string;
}

const PortfolioLayout: React.FC = () => {
  const [currentSection, setCurrentSection] = useState('home');

  const projects: Project[] = [
    {
      id: 1,
      name: 'Project One',
      description: 'A modern web application built with React and TypeScript',
      link: 'https://github.com',
    },
    {
      id: 2,
      name: 'Project Two',
      description: 'Full-stack mobile application with real-time features',
      link: 'https://github.com',
    },
    {
      id: 3,
      name: 'Project Three',
      description: 'Interactive 3D visualization using Three.js',
      link: 'https://github.com',
    },
  ];

  const skills = [
    'React',
    'TypeScript',
    'Three.js',
    'Node.js',
    'WebGL',
    'Python',
    'UI/UX Design',
    'Performance Optimization',
  ];

  const handleNavClick = (section: string) => {
    setCurrentSection(section);
    if ((window as any).particleSceneHandler) {
      (window as any).particleSceneHandler(section);
    }
  };

  return (
    <div className="portfolio-layout">
      {/* Navigation */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="logo">
            <span>Kenneth Leung | Personal Portfolio</span>
          </div>
          <ul className="nav-menu">
            <li>
              <button
                className={`nav-link ${currentSection === 'home' ? 'active' : ''}`}
                onClick={() => handleNavClick('home')}
              >
                Home
              </button>
            </li>
            <li>
              <button
                className={`nav-link ${currentSection === 'about' ? 'active' : ''}`}
                onClick={() => handleNavClick('about')}
              >
                About
              </button>
            </li>
            <li>
              <button
                className={`nav-link ${currentSection === 'projects' ? 'active' : ''}`}
                onClick={() => handleNavClick('projects')}
              >
                Projects
              </button>
            </li>
            <li>
              <button
                className={`nav-link ${currentSection === 'skills' ? 'active' : ''}`}
                onClick={() => handleNavClick('skills')}
              >
                Skills
              </button>
            </li>
            <li>
              <button
                className={`nav-link ${currentSection === 'contact' ? 'active' : ''}`}
                onClick={() => handleNavClick('contact')}
              >
                Contact
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Content Sections */}
      <div className="content-container">
        {/* Home Section */}
        {currentSection === 'home' && (
          <section className="section home-section">
            <div className="hero-content">
              <h1>Welcome to My Portfolio</h1>
              <p className="subtitle">Interactive 3D web experiences with modern technologies</p>
              <div className="cta-buttons">
                <button className="btn btn-primary" onClick={() => handleNavClick('projects')}>
                  View My Work
                </button>
                <button className="btn btn-secondary" onClick={() => handleNavClick('contact')}>
                  Get in Touch
                </button>
              </div>
            </div>
          </section>
        )}

        {/* About Section */}
        {currentSection === 'about' && (
          <section className="section about-section">
            <h2>About Me</h2>
            <p>
              I'm a creative developer passionate about building interactive web experiences with
              Three.js and modern web technologies. I specialize in creating stunning visual
              effects and immersive user interfaces.
            </p>
            <p>
              With expertise in React, TypeScript, and 3D graphics, I transform ideas into
              interactive, performance-optimized web applications.
            </p>
            <p>
              Current student at California State University, Los Angeles, majoring in Computer Science.
              Looking forward to graduating in Spring 2027 and pursuing a career in web development and
              Software Engineering. I'm eager to apply my skills in a dynamic and innovative environment
              where I can contribute to exciting projects and continue learning and growing as a developer.
            </p>
          </section>
        )}

        {/* Projects Section */}
        {currentSection === 'projects' && (
          <section className="section projects-section">
            <h2>My Projects</h2>
            <div className="projects-grid">
              {projects.map((project) => (
                <div key={project.id} className="project-card">
                  <h3>{project.name}</h3>
                  <p>{project.description}</p>
                  {project.link && (
                    <a href={project.link} target="_blank" rel="noopener noreferrer">
                      View Project →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills Section */}
        {currentSection === 'skills' && (
          <section className="section skills-section">
            <h2>Technical Skills</h2>
            <div className="skills-grid">
              {skills.map((skill, index) => (
                <div key={index} className="skill-tag">
                  {skill}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Contact Section */}
        {currentSection === 'contact' && (
          <section className="section contact-section">
            <h2>Get in Touch</h2>
            <p>I'd love to hear from you. Feel free to reach out!</p>
            <div className="contact-links">
              <a href="mailto:your.email@example.com" className="contact-link">
                📧 Email
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="contact-link">
                💻 GitHub
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="contact-link">
                💼 LinkedIn
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="contact-link">
                𝕏 Twitter
              </a>
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>© 2024 Portfolio. Built with React, TypeScript, and Three.js</p>
      </footer>
    </div>
  );
};

export default PortfolioLayout;
