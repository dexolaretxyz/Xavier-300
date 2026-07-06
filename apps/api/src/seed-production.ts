import prisma from './lib/db';
import { Difficulty } from '@prisma/client';

export async function seedProductionClasptek() {
  try {
    console.log('🚀 Checking/Seeding Clasptek_ Mock in production...');
    const domain = await prisma.domain.findUnique({
      where: { slug: 'cybersecurity' }
    });
    if (!domain) {
      console.warn('⚠️ [SEED] Cybersecurity domain not found in database. Skipping.');
      return;
    }

    const certification = await prisma.certification.upsert({
      where: { slug: 'clasptek-mock' },
      update: {
        name: 'Clasptek_ Mock',
        description: 'Clasptek Cybersecurity curriculum mock exam',
        examDuration: 25,
        questionCount: 40,
        difficulty: Difficulty.MEDIUM,
        domainId: domain.id
      },
      create: {
        slug: 'clasptek-mock',
        name: 'Clasptek_ Mock',
        description: 'Clasptek Cybersecurity curriculum mock exam',
        examDuration: 25,
        questionCount: 40,
        difficulty: Difficulty.MEDIUM,
        domainId: domain.id
      }
    });

    console.log(`✅ [SEED] Certification "Clasptek_ Mock" is ready (ID: ${certification.id})`);

    // Check count of approved questions
    const count = await prisma.question.count({
      where: { certificationId: certification.id, status: 'APPROVED' }
    });

    if (count < 40) {
      console.log(`🧹 [SEED] Clasptek_ Mock has only ${count} questions. Re-seeding 40 questions...`);
      await prisma.question.deleteMany({
        where: { certificationId: certification.id }
      });

      const questions = [
        {
          "text": "What is the primary definition of cybersecurity according to the course material?",
          "options": {
            "A": "The design of user-friendly computer interfaces.",
            "B": "The practice of protecting systems, networks, and programs from digital attacks.",
            "C": "The physical maintenance of server hardware.",
            "D": "The process of developing new operating systems."
          },
          "correctAnswer": "B",
          "explanation": "Cybersecurity is the practice of protecting systems, networks, and programs from digital attacks.",
          "topic": "General Cybersecurity"
        },
        {
          "text": "Within the C-I-A Triad, which principle ensures that information is protected from unauthorized access?",
          "options": {
            "A": "Availability",
            "B": "Integrity",
            "C": "Confidentiality",
            "D": "Authorization"
          },
          "correctAnswer": "C",
          "explanation": "Confidentiality ensures that information is protected from unauthorized access.",
          "topic": "CIA Triad"
        },
        {
          "text": "How is a 'Vulnerability' defined in the context of cybersecurity risks?",
          "options": {
            "A": "A potential source of harm to a system or network.",
            "B": "The financial loss resulting from a cyberattack.",
            "C": "A weakness in a system or network that threats can exploit.",
            "D": "A secure protocol used to protect data."
          },
          "correctAnswer": "C",
          "explanation": "A vulnerability is a weakness in a system or network that threats can exploit.",
          "topic": "Cybersecurity Risks"
        },
        {
          "text": "Which type of malware specifically locks data and demands a payment for its release?",
          "options": {
            "A": "Trojan",
            "B": "Ransomware",
            "C": "Spyware",
            "D": "Worm"
          },
          "correctAnswer": "B",
          "explanation": "Ransomware locks data and demands payment for release.",
          "topic": "Malware"
        },
        {
          "text": "An attack where malicious code is inserted into input fields to gain unauthorized access to a database is known as what?",
          "options": {
            "A": "SQL Injection",
            "B": "Denial of Service (DoS)",
            "C": "Man-in-the-Middle (MITM)",
            "D": "Phishing"
          },
          "correctAnswer": "A",
          "explanation": "SQL Injection involves inserting malicious SQL code into input fields to manipulate database queries.",
          "topic": "Web Security"
        },
        {
          "text": "Intercepting communication over a public Wi-Fi network to gain access to sensitive data is an example of which attack?",
          "options": {
            "A": "Man-in-the-Middle (MITM)",
            "B": "DDoS",
            "C": "Insider Threat",
            "D": "Ransomware"
          },
          "correctAnswer": "A",
          "explanation": "Man-in-the-Middle (MITM) attacks intercept communication between two parties.",
          "topic": "Network Attacks"
        },
        {
          "text": "What is the primary motive for 'Hacktivists' to conduct cyberattacks?",
          "options": {
            "A": "Financial gain and extortion.",
            "B": "Political or social causes.",
            "C": "Corporate espionage.",
            "D": "Experimentation and fame."
          },
          "correctAnswer": "B",
          "explanation": "Hacktivists conduct cyberattacks to support political or social causes.",
          "topic": "Attacker Motives"
        },
        {
          "text": "Which term describes low-skill attackers who seek fun or fame by using publicly available hacking tools?",
          "options": {
            "A": "Nation-States",
            "B": "Script Kiddies",
            "C": "Insiders",
            "D": "Cybercriminals"
          },
          "correctAnswer": "B",
          "explanation": "Script Kiddies are low-skill attackers using pre-made public tools for fun or fame.",
          "topic": "Attacker Types"
        },
        {
          "text": "In the Cyber Kill Chain, which phase involves gathering information about the target system?",
          "options": {
            "A": "Exploitation",
            "B": "Installation",
            "C": "Reconnaissance",
            "D": "Weaponization"
          },
          "correctAnswer": "C",
          "explanation": "Reconnaissance is the phase of gathering information about the target.",
          "topic": "Cyber Kill Chain"
        },
        {
          "text": "What is the goal of the 'Command & Control (C2)' phase in the Attack Lifecycle?",
          "options": {
            "A": "To establish communication for remote control of the compromised system.",
            "B": "To steal the target's physical devices.",
            "C": "To send the payload via a phishing email.",
            "D": "To research the target's social media profiles."
          },
          "correctAnswer": "A",
          "explanation": "Command & Control establishes communication channels to control compromised systems remotely.",
          "topic": "Attack Lifecycle"
        },
        {
          "text": "What is the difference between Authentication and Authorization?",
          "options": {
            "A": "Authentication encrypts data, while Authorization decrypts it.",
            "B": "Authentication blocks attacks, while Authorization logs them.",
            "C": "Authentication verifies who you are, while Authorization verifies what you can access.",
            "D": "They are exactly the same concept."
          },
          "correctAnswer": "C",
          "explanation": "Authentication verifies identity; Authorization determines permissions and access levels.",
          "topic": "Authentication & Authorization"
        },
        {
          "text": "Which cybersecurity concept involves converting data into a fixed-length value primarily used for data verification and password storage?",
          "options": {
            "A": "Encryption",
            "B": "Hashing",
            "C": "Authorization",
            "D": "Firewalling"
          },
          "correctAnswer": "B",
          "explanation": "Hashing converts data into a fixed-length one-way value for password storage and integrity verification.",
          "topic": "Cryptography"
        },
        {
          "text": "What are the five core components of the NIST Cybersecurity Framework (CSF)?",
          "options": {
            "A": "Identify, Protect, Detect, Respond, Recover",
            "B": "Assess, Implement, Monitor, Defend, Audit",
            "C": "Confidentiality, Integrity, Availability, Authentication, Authorization",
            "D": "Reconnaissance, Delivery, Exploitation, Installation, Actions"
          },
          "correctAnswer": "A",
          "explanation": "The five core functions of the NIST CSF are Identify, Protect, Detect, Respond, and Recover.",
          "topic": "Frameworks and Standards"
        },
        {
          "text": "What is the primary focus of the ISO/IEC 27001 standard?",
          "options": {
            "A": "Providing technical defense scripts for Linux systems.",
            "B": "Establishing and maintaining an Information Security Management System (ISMS).",
            "C": "Outlining the steps for a successful penetration test.",
            "D": "Defining the legal penalties for cybercriminals."
          },
          "correctAnswer": "B",
          "explanation": "ISO/IEC 27001 focuses on establishing, implementing, operating, and maintaining an Information Security Management System (ISMS).",
          "topic": "Frameworks and Standards"
        },
        {
          "text": "In Risk Management, how is 'Risk' typically calculated?",
          "options": {
            "A": "Threat x Vulnerability",
            "B": "Likelihood x Impact",
            "C": "Asset Value x Mitigation Cost",
            "D": "Authentication x Authorization"
          },
          "correctAnswer": "B",
          "explanation": "Risk is evaluated as Likelihood (probability) multiplied by Impact.",
          "topic": "Risk Management"
        },
        {
          "text": "Which risk treatment strategy involves applying controls (like installing a firewall) to reduce the risk?",
          "options": {
            "A": "Avoid",
            "B": "Accept",
            "C": "Transfer",
            "D": "Mitigate"
          },
          "correctAnswer": "D",
          "explanation": "Risk Mitigation involves implementing controls to reduce the likelihood or impact of a risk.",
          "topic": "Risk Management"
        },
        {
          "text": "If an organization decides to buy cybersecurity insurance, which risk treatment strategy are they employing?",
          "options": {
            "A": "Accept",
            "B": "Transfer",
            "C": "Mitigate",
            "D": "Avoid"
          },
          "correctAnswer": "B",
          "explanation": "Buying insurance is an example of risk transference, shifting the risk to a third party.",
          "topic": "Risk Management"
        },
        {
          "text": "What is the social engineering technique that uses phone calls to impersonate authority figures?",
          "options": {
            "A": "Vishing",
            "B": "Phishing",
            "C": "Smishing",
            "D": "Baiting"
          },
          "correctAnswer": "A",
          "explanation": "Vishing (voice phishing) uses phone calls for social engineering.",
          "topic": "Social Engineering"
        },
        {
          "text": "Which scenario best describes the social engineering tactic known as 'Pretexting'?",
          "options": {
            "A": "Leaving a free USB drive in a company parking lot.",
            "B": "Following an authorized employee through a secure door.",
            "C": "Fabricating a believable story, like pretending to be from HR, to gain trust and extract data.",
            "D": "Sending a text message claiming the user has won a gift card."
          },
          "correctAnswer": "C",
          "explanation": "Pretexting is creating a fabricated scenario (pretext) to persuade a victim to perform actions or release information.",
          "topic": "Social Engineering"
        },
        {
          "text": "An attacker offers a free movie download that actually contains hidden malware. What social engineering tactic is this?",
          "options": {
            "A": "Tailgating",
            "B": "Baiting",
            "C": "Pretexting",
            "D": "Impersonation"
          },
          "correctAnswer": "B",
          "explanation": "Baiting involves promising an item or good (like a free download or USB drive) to entice victims into a trap.",
          "topic": "Social Engineering"
        },
        {
          "text": "What is the primary function of an Operating System (OS)?",
          "options": {
            "A": "To compile source code into executable programs.",
            "B": "To perform network vulnerability scans.",
            "C": "To act as an interface between the user, hardware, and applications while managing resources.",
            "D": "To encrypt all incoming and outgoing network traffic."
          },
          "correctAnswer": "C",
          "explanation": "An Operating System acts as an interface between user applications and the hardware while managing system resources.",
          "topic": "Operating Systems"
        },
        {
          "text": "In the Linux Directory Structure, which directory primarily holds system configuration files?",
          "options": {
            "A": "/bin",
            "B": "/home",
            "C": "/var",
            "D": "/etc"
          },
          "correctAnswer": "D",
          "explanation": "The /etc directory contains system-wide configuration files in Linux.",
          "topic": "Linux Administration"
        },
        {
          "text": "When setting file permissions in Linux using numeric values, what number represents the 'Read' permission?",
          "options": {
            "A": "1",
            "B": "2",
            "C": "4",
            "D": "7"
          },
          "correctAnswer": "C",
          "explanation": "In Linux file permissions, Read = 4, Write = 2, and Execute = 1.",
          "topic": "Linux Administration"
        },
        {
          "text": "What is the goal of 'System Hardening'?",
          "options": {
            "A": "To increase the physical durability of server hardware.",
            "B": "To secure a system by reducing its attack surface and removing unnecessary services.",
            "C": "To intentionally infect a machine with malware to study it.",
            "D": "To ensure maximum internet bandwidth is utilized."
          },
          "correctAnswer": "B",
          "explanation": "System Hardening is the process of securing a system by minimizing its vulnerabilities and reducing its attack surface.",
          "topic": "System Security"
        },
        {
          "text": "How is 'Cyber Hygiene' best described?",
          "options": {
            "A": "The physical cleaning of keyboards and monitors.",
            "B": "Daily practices and habits used to keep devices and data secure from online threats.",
            "C": "A specialized software tool that removes computer viruses.",
            "D": "The process of wiping a hard drive before disposal."
          },
          "correctAnswer": "B",
          "explanation": "Cyber hygiene refers to daily practices and habits that improve security postures and keep devices safe.",
          "topic": "Security Awareness"
        },
        {
          "text": "What are the correct steps in the TCP 3-Way Handshake used to establish a reliable connection?",
          "options": {
            "A": "HELLO, READY, GO",
            "B": "PING, PONG, ACK",
            "C": "SYN, SYN-ACK, ACK",
            "D": "REQ, RES, ACK"
          },
          "correctAnswer": "C",
          "explanation": "The TCP handshake process uses SYN, SYN-ACK, and ACK flags to establish connections.",
          "topic": "Networking Protocols"
        },
        {
          "text": "What is the function of the Domain Name System (DNS)?",
          "options": {
            "A": "To translate human-readable domain names into IP addresses.",
            "B": "To encrypt traffic between a web browser and a server.",
            "C": "To block malicious packets from entering the local network.",
            "D": "To automatically assign IP addresses to new devices on a network."
          },
          "correctAnswer": "A",
          "explanation": "DNS translates domain names like example.com to machine-routable IP addresses.",
          "topic": "Networking Protocols"
        },
        {
          "text": "Which network device is responsible for connecting multiple different networks and directing data traffic between them using IP addresses?",
          "options": {
            "A": "Switch",
            "B": "Hub",
            "C": "Router",
            "D": "Modem"
          },
          "correctAnswer": "C",
          "explanation": "A Router routes packets between different networks at Layer 3 of the OSI model using IP addresses.",
          "topic": "Network Devices"
        },
        {
          "text": "Which network device connects multiple devices within the same Local Area Network (LAN) and uses MAC addresses for packet forwarding?",
          "options": {
            "A": "Router",
            "B": "Firewall",
            "C": "Access Point (AP)",
            "D": "Switch"
          },
          "correctAnswer": "D",
          "explanation": "A Switch forwards packets within a single network at Layer 2 using MAC addresses.",
          "topic": "Network Devices"
        },
        {
          "text": "What type of firewall tracks sessions and connection states to make intelligent traffic decisions?",
          "options": {
            "A": "Stateless Firewall",
            "B": "Stateful Firewall",
            "C": "Hub Firewall",
            "D": "Proxy Server"
          },
          "correctAnswer": "B",
          "explanation": "A Stateful Firewall tracks connection states and sessions to perform packet filtering.",
          "topic": "Firewalls"
        },
        {
          "text": "Using tools like Nmap to directly probe a target for open ports and services is an example of what?",
          "options": {
            "A": "Passive Reconnaissance",
            "B": "Active Reconnaissance",
            "C": "Weaponization",
            "D": "Post-Exploitation"
          },
          "correctAnswer": "B",
          "explanation": "Active Reconnaissance involves directly interacting with the target system to discover open ports and services.",
          "topic": "Ethical Hacking"
        },
        {
          "text": "What is the primary function of the Nmap tool in ethical hacking?",
          "options": {
            "A": "To crack password hashes offline.",
            "B": "To act as a web vulnerability scanner.",
            "C": "To discover hosts, open ports, and services on a network.",
            "D": "To launch phishing campaigns."
          },
          "correctAnswer": "C",
          "explanation": "Nmap is primarily used for host discovery, port scanning, and service version detection.",
          "topic": "Ethical Hacking Tools"
        },
        {
          "text": "Which of the following best describes OpenVAS?",
          "options": {
            "A": "A password management vault.",
            "B": "A comprehensive automated vulnerability assessment platform.",
            "C": "A Linux operating system distribution.",
            "D": "A dynamic routing protocol."
          },
          "correctAnswer": "B",
          "explanation": "OpenVAS is an open-source, comprehensive vulnerability scanning and assessment platform.",
          "topic": "Vulnerability Scanning"
        },
        {
          "text": "In the OWASP Top 10 web risks, what does 'A01' represent?",
          "options": {
            "A": "Injection",
            "B": "Cryptographic Failures",
            "C": "Security Misconfiguration",
            "D": "Broken Access Control"
          },
          "correctAnswer": "D",
          "explanation": "In the latest OWASP Top 10, A01 represents Broken Access Control.",
          "topic": "OWASP Top 10"
        },
        {
          "text": "For what primary purpose do security professionals use Burp Suite?",
          "options": {
            "A": "As a web proxy to intercept and manipulate HTTP traffic.",
            "B": "To capture and analyze Layer 2 network packets.",
            "C": "To generate graphical network diagrams.",
            "D": "To execute brute-force attacks on RDP servers."
          },
          "correctAnswer": "A",
          "explanation": "Burp Suite is a web proxy used to intercept, inspect, and modify HTTP/S traffic between browsers and web applications.",
          "topic": "Ethical Hacking Tools"
        },
        {
          "text": "What post-exploitation action involves an attacker increasing their access from a limited user to a root or admin account?",
          "options": {
            "A": "Pivoting",
            "B": "Lateral Movement",
            "C": "Privilege Escalation",
            "D": "Data Exfiltration"
          },
          "correctAnswer": "C",
          "explanation": "Privilege Escalation is the process of gaining higher level privileges than initially assigned.",
          "topic": "Post-Exploitation"
        },
        {
          "text": "In the Metasploit Framework, what term is used for the code that is executed on the target system after an exploit is successful?",
          "options": {
            "A": "Handler",
            "B": "Payload",
            "C": "Auxiliary",
            "D": "Encoder"
          },
          "correctAnswer": "B",
          "explanation": "The payload is the code that runs on the target system after successful exploitation (e.g., establishing a shell).",
          "topic": "Ethical Hacking Tools"
        },
        {
          "text": "What is the primary benefit of Multi-Factor Authentication (MFA)?",
          "options": {
            "A": "It encrypts user data stored on local hard drives.",
            "B": "It adds a strong layer of protection by requiring two or more verification methods.",
            "C": "It completely automates the password creation process.",
            "D": "It eliminates the need for firewalls in a corporate network."
          },
          "correctAnswer": "B",
          "explanation": "MFA drastically improves security by verifying multiple independent credentials across different factor categories.",
          "topic": "Authentication"
        },
        {
          "text": "How many bits constitute an IPv4 address?",
          "options": {
            "A": "16-bit",
            "B": "64-bit",
            "C": "128-bit",
            "D": "32-bit"
          },
          "correctAnswer": "D",
          "explanation": "An IPv4 address consists of 32 bits divided into four octets.",
          "topic": "Networking Basics"
        },
        {
          "text": "What is the key difference between Private and Public IP addresses?",
          "options": {
            "A": "Public IPs are only for servers, while private IPs are for mobile phones.",
            "B": "Private IPs are used on the Internet, while public IPs are for local networks.",
            "C": "Private IPs are used within local networks, while public IPs are assigned by ISPs and visible on the Internet.",
            "D": "Private IPs are fully encrypted by default, whereas public IPs are unencrypted."
          },
          "correctAnswer": "C",
          "explanation": "Private IP addresses are reserved for internal use inside local networks, while public IPs are routable on the global Internet.",
          "topic": "Networking Basics"
        }
      ];

      await prisma.question.createMany({
        data: questions.map(q => ({
          certificationId: certification.id,
          text: q.text,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          topic: q.topic,
          difficulty: Difficulty.MEDIUM,
          source: 'ADMIN',
          status: 'APPROVED',
          questionType: 'MCQ'
        }))
      });
      console.log('🎉 [SEED] Imported 40 questions for Clasptek_ Mock in production!');
    } else {
      console.log(`ℹ️ [SEED] Clasptek_ Mock already has ${count} questions. Skipping import.`);
    }
  } catch (error) {
    console.error('❌ [SEED] Error during production seeding:', error);
  }
}
