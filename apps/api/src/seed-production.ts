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
        questionCount: 25,
        difficulty: Difficulty.MEDIUM,
        domainId: domain.id
      },
      create: {
        slug: 'clasptek-mock',
        name: 'Clasptek_ Mock',
        description: 'Clasptek Cybersecurity curriculum mock exam',
        examDuration: 25,
        questionCount: 25,
        difficulty: Difficulty.MEDIUM,
        domainId: domain.id
      }
    });

    console.log(`✅ [SEED] Certification "Clasptek_ Mock" is ready (ID: ${certification.id})`);

    // Update CompTIA Security+ certification config to 90 minutes and 90 questions
    await prisma.certification.updateMany({
      where: { slug: 'cybersecurity' },
      data: {
        examDuration: 90,
        questionCount: 90
      }
    });
    console.log('✅ [SEED] Updated CompTIA Security+ (slug: cybersecurity) to 90 mins and 90 questions.');

    // Check count of approved questions
    const count = await prisma.question.count({
      where: { certificationId: certification.id, status: 'APPROVED' }
    });

    if (count !== 25) {
      console.log(`🧹 [SEED] Clasptek_ Mock has ${count} questions. Re-seeding 25 questions...`);
      await prisma.question.deleteMany({
        where: { certificationId: certification.id }
      });

      const questions = [
        {
          "text": "Within the C-I-A Triad, which principle ensures the accuracy and completeness of information?",
          "options": {
            "A": "Confidentiality",
            "B": "Integrity",
            "C": "Availability",
            "D": "Authentication"
          },
          "correctAnswer": "B",
          "explanation": "Integrity ensures the accuracy and completeness of information.",
          "topic": "CIA Triad"
        },
        {
          "text": "Which type of malware specifically locks data and demands a payment for its release?",
          "options": {
            "A": "Spyware",
            "B": "Trojan",
            "C": "Ransomware",
            "D": "Worm"
          },
          "correctAnswer": "C",
          "explanation": "Ransomware locks data and demands a payment for its release.",
          "topic": "Malware"
        },
        {
          "text": "Intercepting communications between two parties to gain access to sensitive data is known as what type of attack?",
          "options": {
            "A": "Denial of Service",
            "B": "SQL Injection",
            "C": "Insider Threat",
            "D": "Man-in-the-Middle (MITM)"
          },
          "correctAnswer": "D",
          "explanation": "Intercepting communications between two parties to gain access to sensitive data is known as a Man-in-the-Middle (MITM) attack.",
          "topic": "Network Attacks"
        },
        {
          "text": "What is the process of converting data into a fixed-length value primarily used for data verification, such as password storage?",
          "options": {
            "A": "Encryption",
            "B": "Hashing",
            "C": "Routing",
            "D": "Authorization"
          },
          "correctAnswer": "B",
          "explanation": "Hashing converts data into a fixed-length value for verification and password storage.",
          "topic": "Cryptography"
        },
        {
          "text": "In the Cyber Kill Chain, which phase involves gathering information about the target system?",
          "options": {
            "A": "Exploitation",
            "B": "Delivery",
            "C": "Reconnaissance",
            "D": "Installation"
          },
          "correctAnswer": "C",
          "explanation": "Reconnaissance is the phase of gathering information about the target.",
          "topic": "Cyber Kill Chain"
        },
        {
          "text": "Which threat actors are primarily motivated by political or social causes?",
          "options": {
            "A": "Cybercriminals",
            "B": "Script Kiddies",
            "C": "Nation-States",
            "D": "Hacktivists"
          },
          "correctAnswer": "D",
          "explanation": "Hacktivists are threat actors motivated by political or social causes.",
          "topic": "Attacker Motives"
        },
        {
          "text": "What are the five core components of the NIST Cybersecurity Framework (CSF)?",
          "options": {
            "A": "Identify, Protect, Detect, Respond, Recover",
            "B": "Assess, Implement, Monitor, Defend, Audit",
            "C": "Confidentiality, Integrity, Availability, Authentication, Authorization",
            "D": "Reconnaissance, Weaponization, Delivery, Exploitation, Installation"
          },
          "correctAnswer": "A",
          "explanation": "The five core functions of the NIST CSF are Identify, Protect, Detect, Respond, and Recover.",
          "topic": "Frameworks and Standards"
        },
        {
          "text": "Which global framework focuses on establishing, implementing, and maintaining an Information Security Management System (ISMS)?",
          "options": {
            "A": "NIST RMF",
            "B": "CIS Controls",
            "C": "ISO/IEC 27001",
            "D": "GDPR"
          },
          "correctAnswer": "C",
          "explanation": "ISO/IEC 27001 focuses on establishing, implementing, operating, and maintaining an Information Security Management System (ISMS).",
          "topic": "Frameworks and Standards"
        },
        {
          "text": "In risk management, how is a Risk Score typically calculated?",
          "options": {
            "A": "Threat × Vulnerability",
            "B": "Asset Value × Mitigation Cost",
            "C": "Likelihood × Impact",
            "D": "Authentication × Authorization"
          },
          "correctAnswer": "C",
          "explanation": "Risk is evaluated as Likelihood (probability) multiplied by Impact.",
          "topic": "Risk Management"
        },
        {
          "text": "Buying cybersecurity insurance or outsourcing a service is an example of which risk treatment strategy?",
          "options": {
            "A": "Avoid",
            "B": "Mitigate",
            "C": "Accept",
            "D": "Transfer"
          },
          "correctAnswer": "D",
          "explanation": "Transferring risk involves shifting the risk to a third party (like buying insurance).",
          "topic": "Risk Management"
        },
        {
          "text": "What is the core software that manages hardware resources and acts as the interface between the user, hardware, and applications?",
          "options": {
            "A": "Command Line Interface",
            "B": "Operating System",
            "C": "File System",
            "D": "Hypervisor"
          },
          "correctAnswer": "B",
          "explanation": "An Operating System acts as an interface between user applications and hardware while managing resources.",
          "topic": "Operating Systems"
        },
        {
          "text": "When setting file permissions in Linux using numeric values, what number represents the \"Read\" permission?",
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
          "text": "What is the primary purpose of system hardening?",
          "options": {
            "A": "Upgrading physical server components",
            "B": "Securing a system by reducing its attack surface",
            "C": "Implementing automated vulnerability scanners",
            "D": "Increasing network bandwidth"
          },
          "correctAnswer": "B",
          "explanation": "System Hardening is the process of securing a system by minimizing its vulnerabilities and reducing its attack surface.",
          "topic": "System Security"
        },
        {
          "text": "What social engineering tactic involves attackers using phone calls to impersonate authority figures?",
          "options": {
            "A": "Phishing",
            "B": "Baiting",
            "C": "Vishing",
            "D": "Tailgating"
          },
          "correctAnswer": "C",
          "explanation": "Vishing (voice phishing) uses phone calls for social engineering.",
          "topic": "Social Engineering"
        },
        {
          "text": "Which network service translates human-readable domain names (like www.example.com) into IP addresses?",
          "options": {
            "A": "DHCP",
            "B": "DNS",
            "C": "ARP",
            "D": "NAT"
          },
          "correctAnswer": "B",
          "explanation": "DNS translates domain names like example.com to machine-routable IP addresses.",
          "topic": "Networking Protocols"
        },
        {
          "text": "Which access control model assigns permissions based on a user's job function or group within an organization?",
          "options": {
            "A": "Discretionary Access Control (DAC)",
            "B": "Role-Based Access Control (RBAC)",
            "C": "Mandatory Access Control (MAC)",
            "D": "Physical Access Control"
          },
          "correctAnswer": "B",
          "explanation": "RBAC assigns permissions based on job roles or functions within an organization.",
          "topic": "Access Control"
        },
        {
          "text": "Which network device operates at Layer 2 and uses MAC addresses to forward packets to multiple devices within the same LAN?",
          "options": {
            "A": "Router",
            "B": "Hub",
            "C": "Modem",
            "D": "Switch"
          },
          "correctAnswer": "D",
          "explanation": "A Switch forwards packets within a single network at Layer 2 using MAC addresses.",
          "topic": "Network Devices"
        },
        {
          "text": "What are the correct steps in the TCP 3-Way Handshake used to establish a reliable connection?",
          "options": {
            "A": "SYN, SYN-ACK, ACK",
            "B": "REQ, RES, ACK",
            "C": "PING, PONG, ACK",
            "D": "HELLO, READY, GO"
          },
          "correctAnswer": "A",
          "explanation": "The TCP handshake process uses SYN, SYN-ACK, and ACK flags to establish connections.",
          "topic": "Networking Protocols"
        },
        {
          "text": "Which network security zone is designed to specifically host public-facing servers like web or mail servers?",
          "options": {
            "A": "Internal Network",
            "B": "Perimeter Network",
            "C": "Demilitarized Zone (DMZ)",
            "D": "Virtual Local Area Network (VLAN)"
          },
          "correctAnswer": "C",
          "explanation": "A DMZ is a physical or logical subnetwork that contains and exposes an organization's external-facing services.",
          "topic": "Network Security"
        },
        {
          "text": "Which tool is a free, open-source network protocol analyzer used for capturing live packets?",
          "options": {
            "A": "Nmap",
            "B": "Snort",
            "C": "Wireshark",
            "D": "Metasploit"
          },
          "correctAnswer": "C",
          "explanation": "Wireshark is a popular network protocol analyzer used to capture and inspect packets.",
          "topic": "Ethical Hacking Tools"
        },
        {
          "text": "Which dynamic routing protocol utilizes the Dijkstra algorithm and divides the network into areas to optimize routing?",
          "options": {
            "A": "BGP",
            "B": "RIP",
            "C": "EIGRP",
            "D": "OSPF"
          },
          "correctAnswer": "D",
          "explanation": "OSPF (Open Shortest Path First) is a link-state routing protocol that utilizes Dijkstra's algorithm.",
          "topic": "Routing Protocols"
        },
        {
          "text": "What type of firewall tracks active sessions and connection states to make more intelligent traffic decisions?",
          "options": {
            "A": "Stateless Firewall",
            "B": "Stateful Firewall",
            "C": "Packet-Filtering Firewall",
            "D": "Web Application Firewall"
          },
          "correctAnswer": "B",
          "explanation": "A Stateful Firewall tracks connection states and sessions to perform packet filtering.",
          "topic": "Firewalls"
        },
        {
          "text": "In Cisco networking, what is the defining characteristic of a Standard Access Control List (ACL)?",
          "options": {
            "A": "It filters based on source IP only.",
            "B": "It filters based on source, destination, protocol, and port.",
            "C": "It automatically encrypts the traffic it allows.",
            "D": "It can only be applied to outbound traffic."
          },
          "correctAnswer": "A",
          "explanation": "Standard ACLs filter traffic based only on the source IP address.",
          "topic": "Cisco Networking"
        },
        {
          "text": "Which command is used on a Cisco device to encrypt plaintext passwords in the configuration file?",
          "options": {
            "A": "enable secret",
            "B": "login local",
            "C": "service password-encryption",
            "D": "transport input ssh"
          },
          "correctAnswer": "C",
          "explanation": "The `service password-encryption` command encrypts plaintext passwords in the Cisco configuration file.",
          "topic": "Cisco Networking"
        },
        {
          "text": "Which protocol is primarily used to collect and store log messages from various network devices?",
          "options": {
            "A": "SNMP",
            "B": "SSH",
            "C": "Syslog",
            "D": "SMTP"
          },
          "correctAnswer": "C",
          "explanation": "Syslog is a standard protocol for collecting and sending log messages from network devices.",
          "topic": "Network Protocols"
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
      console.log('🎉 [SEED] Imported 25 questions for Clasptek_ Mock in production!');
    } else {
      console.log(`ℹ️ [SEED] Clasptek_ Mock already has ${count} questions. Skipping import.`);
    }
  } catch (error) {
    console.error('❌ [SEED] Error during production seeding:', error);
  }
}
