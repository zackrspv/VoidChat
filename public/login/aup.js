// Function to display the AUP
function showAUP() {
    const existingPopup = document.querySelector('.popup');
    if (existingPopup) {
      existingPopup.classList.add('close');
      setTimeout(() => {
        existingPopup.remove();
      }, 400);
      return;
    }
    const aupContent = `
      <h2>Usage Policy</h2>
  
      <h3>1. Prohibited Activities</h3>
      <p>1.1. Malicious Intent: Any use of the program and services for malicious purposes is strictly prohibited. This includes, but is not limited to, attempting to gain unauthorized access to systems, spreading malware or viruses, conducting phishing attacks, or engaging in any activity that disrupts or compromises the security and integrity of the program and services.</p>
      <p>1.2. Illegal Activities: You may not use the program and services for any illegal activities. This includes, but is not limited to, engaging in unauthorized data access or theft, infringement of intellectual property rights, distribution of illegal content, or any other activity that violates applicable laws and regulations.</p>
      <p>1.3. Harmful Conduct: Engaging in conduct that is harmful, abusive, or offensive towards others is strictly prohibited. This includes, but is not limited to, harassment, defamation, hate speech, or any other behavior that creates a hostile environment or causes harm to individuals or groups.</p>
      <p>1.4. Resource Abuse: Any excessive or unauthorized use of the program and services that consumes an unreasonable amount of system resources or negatively impacts the performance and availability of the program and services is prohibited.</p>
  
      <h3>2. User Responsibilities</h3>
      <p>2.1. Compliance with Laws: You must comply with all applicable laws, regulations, and legal obligations while using the program and services.</p>
      <p>2.2. Lawful Use: You may only use the program and services for lawful purposes and in accordance with this Policy.</p>
      <p>2.3. Reporting Violations: If you become aware of any violation of this Policy or any suspicious or unauthorized activity, you must immediately report it to ircChat.</p>
  
      <h3>3. Consequences of Violation</h3>
      <p>3.1. Investigation: ircChat reserves the right to investigate any suspected violation of this Policy. This may include gathering information from users, reviewing logs and records, and cooperating with law enforcement authorities.</p>
      <p>3.2. Enforcement Actions: In the event of a violation of this Policy, ircChat may take appropriate enforcement actions, which may include, but are not limited to, issuing warnings, suspending or terminating access to the program and services, and pursuing legal remedies.</p>
  
      <h3>4. Policy Updates</h3>
      <p>4.1. ircChat may update this Policy from time to time to reflect changes in the program and services or to address emerging security and legal concerns. The updated Policy will be posted on ircChat's website, and it is your responsibility to review and comply with the most recent version of the Policy.</p>
  
      <p>Copyright &copy; 2023 ircChat</p>
      <p>Copyright &copy; 2023 ButterDebugger</p>
      <p>Copyright &copy; 2023 HeyItsSloth</p>
    `;
  
    const popup = document.createElement('div');
    popup.className = 'popup';
    popup.innerHTML = `
      <div class="popup-content">
        <span id="close-button"></span>
        ${aupContent}
      </div>
    `;
  
    // Function to hide the popup
    function hideAUP() {
        popup.classList.add('close'); // Add the .close class
        setTimeout(() => {
          popup.style.display = 'none';
        }, 600); // Delay hiding the popup to allow the animation to complete
      }
  
    const closeButton = popup.querySelector('#close-button');
    closeButton.addEventListener('click', hideAUP);
  
    document.body.appendChild(popup);
  }
  
  // Add event listener to the info button
  const infoButton = document.querySelector('#info-button');
  infoButton.addEventListener('click', showAUP);