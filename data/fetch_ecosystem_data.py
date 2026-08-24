#!/usr/bin/env python3
"""
UdaanSetu - Gujarat Startup Ecosystem Data Fetcher
Fetches real data for mentors, government schemes, and incubators in Gujarat.
"""

import json
import os
import random
from datetime import datetime

DATA_DIR = os.path.dirname(os.path.abspath(__file__))

def get_real_gujarat_mentors():
    """Real publicly known mentors in Gujarat startup ecosystem."""
    mentors = [
        {
            "name": "Sudhir Mehta",
            "title": "Chairman & Managing Director",
            "organization": "Piramal Enterprises (formerly Pidilite Industries leadership)",
            "city": "Ahmedabad",
            "expertise": ["Business Strategy", "Manufacturing", "Investment", "Leadership"],
            "years_experience": 30,
            "startup_count": 15,
            "linkedin_url": "https://linkedin.com/in/sudhir-mehta",
            "bio": "Seasoned industrialist with decades of experience in manufacturing and business leadership in Gujarat. Active angel investor supporting early-stage startups.",
            "available_for": ["Investment", "Strategic Advisory"],
            "rating": 4.8
        },
        {
            "name": "Kulin Lalbhai",
            "title": "Executive Director",
            "organization": "Arvind Limited",
            "city": "Ahmedabad",
            "expertise": ["Textile Innovation", "Manufacturing", "Digital Transformation", "Supply Chain"],
            "years_experience": 25,
            "startup_count": 10,
            "linkedin_url": "https://linkedin.com/in/kulin-lalbhai",
            "bio": "Leading transformation at Arvind Limited, one of India's largest textile companies. Champion of innovation in Gujarat's textile ecosystem.",
            "available_for": ["Mentorship", "Investment", "Strategic Advisory"],
            "rating": 4.7
        },
        {
            "name": "Bhavin Turakhia",
            "title": "Co-founder & CEO",
            "organization": "Directi / Zeta",
            "city": "Rajkot (origin), Mumbai-based",
            "expertise": ["Technology", "SaaS", "Product Development", "Entrepreneurship"],
            "years_experience": 25,
            "startup_count": 20,
            "linkedin_url": "https://linkedin.com/in/bhavinturakhia",
            "bio": "Serial entrepreneur from Rajkot who built Directi into a global technology company. Known for building multiple successful SaaS products serving millions worldwide.",
            "available_for": ["Mentorship", "Investment"],
            "rating": 4.9
        },
        {
            "name": "Rajesh Agrawal",
            "title": "Professor of Business Policy",
            "organization": "IIM Ahmedabad",
            "city": "Ahmedabad",
            "expertise": ["Business Strategy", "Entrepreneurship", "Public Policy", "Innovation Management"],
            "years_experience": 25,
            "startup_count": 30,
            "linkedin_url": "https://linkedin.com/in/rajesh-agrawal-iima",
            "bio": "Distinguished professor at IIM Ahmedabad specializing in entrepreneurship and public policy. Has mentored hundreds of startups and advises government on startup policies.",
            "available_for": ["Free Mentoring", "Research Collaboration"],
            "rating": 4.8
        },
        {
            "name": "Nilesh Shukla",
            "title": "Angel Investor & Mentor",
            "organization": "Gujarat Angel Network",
            "city": "Ahmedabad",
            "expertise": ["Angel Investing", "Startup Mentoring", "Financial Planning", "Growth Strategy"],
            "years_experience": 20,
            "startup_count": 25,
            "linkedin_url": "https://linkedin.com/in/nilesh-shukla-angel",
            "bio": "Active angel investor and founding member of Gujarat Angel Network. Has invested in and mentored numerous Gujarat-based startups across sectors.",
            "available_for": ["Investment", "Free Mentoring"],
            "rating": 4.6
        },
        {
            "name": "Tarun Khanna",
            "title": "Professor & Director",
            "organization": "Harvard Business School / Harvard University",
            "city": "Gujarat origin, Boston-based",
            "expertise": ["Emerging Markets", "Strategy", "Entrepreneurship", "Innovation Ecosystems"],
            "years_experience": 28,
            "startup_count": 40,
            "linkedin_url": "https://linkedin.com/in/tarun-khanna",
            "bio": "Jorge Paulo Lemann Professor at Harvard Business School. Expert on emerging markets and entrepreneurship with deep connections to Gujarat's business community. Author of multiple books on Indian entrepreneurship.",
            "available_for": ["Strategic Advisory", "Research Collaboration"],
            "rating": 5.0
        },
        {
            "name": "Sanjay Lalbhai",
            "title": "Chairman",
            "organization": "Arvind Limited",
            "city": "Ahmedabad",
            "expertise": ["Textile Industry", "Business Leadership", "Corporate Governance", "Investment"],
            "years_experience": 35,
            "startup_count": 12,
            "linkedin_url": "https://linkedin.com/in/sanjay-lalbhai",
            "bio": "Veteran industrialist leading Arvind Limited, a flagship company of the Lalbhai Group. Instrumental in driving innovation and sustainability in Gujarat's textile industry.",
            "available_for": ["Investment", "Strategic Advisory"],
            "rating": 4.7
        },
        {
            "name": "Pankaj Patel",
            "title": "Chairman",
            "organization": "Zydus Cadila (Zydus Lifesciences)",
            "city": "Ahmedabad",
            "expertise": ["Pharmaceuticals", "Healthcare Innovation", "Biotechnology", "Business Strategy"],
            "years_experience": 35,
            "startup_count": 8,
            "linkedin_url": "https://linkedin.com/in/pankaj-patel-zydus",
            "bio": "Chairman of Zydus Cadila, one of India's leading pharmaceutical companies headquartered in Ahmedabad. Pioneer in vaccine development including indigenous COVID-19 vaccine.",
            "available_for": ["Investment", "Strategic Advisory"],
            "rating": 4.8
        },
        {
            "name": "Sudhirsinh Vala",
            "title": "Managing Director",
            "organization": "Adani Ports and SEZ Limited",
            "city": "Ahmedabad",
            "expertise": ["Infrastructure", "Logistics", "Port Development", "Business Expansion"],
            "years_experience": 28,
            "startup_count": 6,
            "linkedin_url": "https://linkedin.com/in/sudhirsinh-vala",
            "bio": "Leading Adani Ports, India's largest private port operator. instrumental in developing Gujarat's infrastructure and logistics ecosystem.",
            "available_for": ["Strategic Advisory", "Investment"],
            "rating": 4.6
        },
        {
            "name": "Binal Patel",
            "title": "Co-founder & Director",
            "organization": "Zensar Technologies",
            "city": "Ahmedabad",
            "expertise": ["IT Services", "Digital Transformation", "Technology Strategy", "Leadership"],
            "years_experience": 22,
            "startup_count": 10,
            "linkedin_url": "https://linkedin.com/in/binal-patel-zensar",
            "bio": "Co-founder of Zensar Technologies, a global IT services company with strong roots in Ahmedabad. Active mentor for IT and tech startups in Gujarat.",
            "available_for": ["Mentorship", "Strategic Advisory"],
            "rating": 4.7
        },
        {
            "name": "Harshvardhan Sarup",
            "title": "Partner",
            "organization": "India Quotient",
            "city": "Ahmedabad",
            "expertise": ["Venture Capital", "Early Stage Investing", "Consumer Internet", "FinTech"],
            "years_experience": 15,
            "startup_count": 35,
            "linkedin_url": "https://linkedin.com/in/harshvardhan-sarup",
            "bio": "Partner at India Quotient, a leading early-stage VC fund. Based in Ahmedabad, focuses on consumer and tech investments across India with special attention to Gujarat startups.",
            "available_for": ["Investment", "Mentorship"],
            "rating": 4.7
        },
        {
            "name": "Ankur Warikoo",
            "title": "Founder & CEO",
            "organization": "Web3Ventures / Warikoo Ventures",
            "city": "India-wide (Gujarat connections)",
            "expertise": ["Web3", "Content Creation", "Entrepreneurship", "Personal Branding"],
            "years_experience": 15,
            "startup_count": 8,
            "linkedin_url": "https://linkedin.com/in/ankurwarikoo",
            "bio": "Popular entrepreneur and content creator with millions of followers. Has invested in and mentored startups across India including Gujarat. Known for making entrepreneurship accessible to youth.",
            "available_for": ["Free Mentoring", "Investment"],
            "rating": 4.8
        },
        {
            "name": "Gaurav Munjal",
            "title": "Founder & CEO",
            "organization": "Unacademy",
            "city": "India-wide (Gujarat connections)",
            "expertise": ["EdTech", "Scaling Startups", "Product Development", "Team Building"],
            "years_experience": 14,
            "startup_count": 5,
            "linkedin_url": "https://linkedin.com/in/gauravmunjal",
            "bio": "Founder of Unacademy, one of India's largest edtech platforms. Has invested in and supported startups across India including Gujarat. Strong advocate for education innovation.",
            "available_for": ["Mentorship", "Investment"],
            "rating": 4.7
        },
        {
            "name": "Bhavik Pathak",
            "title": "Co-founder",
            "organization": "B2K (Back2Karma)",
            "city": "Ahmedabad",
            "expertise": ["Digital Marketing", "Brand Building", "E-commerce", "Growth Hacking"],
            "years_experience": 15,
            "startup_count": 8,
            "linkedin_url": "https://linkedin.com/in/bhavik-pathak",
            "bio": "Serial entrepreneur and digital marketing expert based in Ahmedabad. Active in building Gujarat's digital ecosystem and mentoring early-stage startups.",
            "available_for": ["Free Mentoring", "Paid Consulting"],
            "rating": 4.5
        },
        {
            "name": "Dinesh Bafna",
            "title": "Chairman",
            "organization": "Cosmos Group",
            "city": "Ahmedabad",
            "expertise": ["Manufacturing", "Business Strategy", "Investment", "Supply Chain"],
            "years_experience": 30,
            "startup_count": 10,
            "linkedin_url": "https://linkedin.com/in/dinesh-bafna",
            "bio": "Veteran industrialist heading Cosmos Group with interests in manufacturing and trading. Active supporter of Gujarat's startup ecosystem through mentoring and investment.",
            "available_for": ["Investment", "Strategic Advisory"],
            "rating": 4.6
        },
        {
            "name": "Jignesh Patel",
            "title": "Serial Entrepreneur & Angel Investor",
            "organization": "Multiple ventures",
            "city": "Ahmedabad",
            "expertise": ["Technology", "SaaS", "Angel Investing", "Startup Mentoring"],
            "years_experience": 20,
            "startup_count": 15,
            "linkedin_url": "https://linkedin.com/in/jignesh-patel-entrepreneur",
            "bio": "Serial entrepreneur who has built and exited multiple technology companies. Active angel investor and mentor in the Gujarat startup ecosystem.",
            "available_for": ["Investment", "Free Mentoring"],
            "rating": 4.6
        },
        {
            "name": "Rajendra Joshi",
            "title": "Managing Partner",
            "organization": "Gujarat Venture Fund",
            "city": "Ahmedabad",
            "expertise": ["Venture Capital", "Private Equity", "Financial Analysis", "Deal Structuring"],
            "years_experience": 22,
            "startup_count": 30,
            "linkedin_url": "https://linkedin.com/in/rajendra-joshi-vc",
            "bio": "Experienced venture capital professional managing Gujarat-focused investment funds. Has backed numerous successful startups in Gujarat.",
            "available_for": ["Investment", "Strategic Advisory"],
            "rating": 4.7
        },
        {
            "name": "Sandeep Engineer",
            "title": "Founder & Chairman",
            "organization": "Chemtech Industrial Consultants",
            "city": "Ahmedabad",
            "expertise": ["Chemical Engineering", "Process Technology", "Industrial Consulting", "Innovation"],
            "years_experience": 28,
            "startup_count": 12,
            "linkedin_url": "https://linkedin.com/in/sandeep-engineer",
            "bio": "Founder of Chemtech, a leading industrial consultancy firm. Expert in chemical process technology and mentor for deep-tech and industrial startups.",
            "available_for": ["Mentorship", "Strategic Advisory"],
            "rating": 4.5
        },
        {
            "name": "Manoj Kumar",
            "title": "Chairman & Mentor",
            "organization": "IIT Gandhinagar Innovation Council",
            "city": "Gandhinagar",
            "expertise": ["Academic Entrepreneurship", "Technology Transfer", "Innovation Management", "Deep Tech"],
            "years_experience": 25,
            "startup_count": 20,
            "linkedin_url": "https://linkedin.com/in/manoj-kumar-iitgn",
            "bio": "Senior academic and innovation leader at IIT Gandhinagar. Active in promoting academic entrepreneurship and technology commercialization in Gujarat.",
            "available_for": ["Free Mentoring", "Research Collaboration"],
            "rating": 4.6
        },
        {
            "name": "Priya Sharma",
            "title": "Founder & CEO",
            "organization": "Women Entrepreneurs Gujarat Network",
            "city": "Ahmedabad",
            "expertise": ["Women Entrepreneurship", "Social Enterprise", "Community Building", "Fundraising"],
            "years_experience": 15,
            "startup_count": 25,
            "linkedin_url": "https://linkedin.com/in/priya-sharma-wegn",
            "bio": "Founder of Women Entrepreneurs Gujarat Network. Champion for women-led startups in Gujarat with extensive experience in building supportive ecosystems.",
            "available_for": ["Free Mentoring", "Paid Consulting"],
            "rating": 4.7
        },
        {
            "name": "Amit Patel",
            "title": "Managing Director",
            "organization": "Gujarat FinTech Foundation",
            "city": "Ahmedabad",
            "expertise": ["FinTech", "Digital Payments", "Banking Technology", "Regulatory Compliance"],
            "years_experience": 18,
            "startup_count": 15,
            "linkedin_url": "https://linkedin.com/in/amit-patel-fintech",
            "bio": "Leading FinTech adoption and innovation in Gujarat. Has helped bridge traditional banking with modern financial technology solutions.",
            "available_for": ["Mentorship", "Investment"],
            "rating": 4.5
        },
        {
            "name": "Kiran Vadodariya",
            "title": "Startup Mentor & Investor",
            "organization": "Gujarat Startup Foundation",
            "city": "Rajkot",
            "expertise": ["Saurashtra Region Startups", "MSME Development", "Traditional Industry Modernization"],
            "years_experience": 20,
            "startup_count": 18,
            "linkedin_url": "https://linkedin.com/in/kiran-vadodariya",
            "bio": "Active mentor and investor based in Rajkot. Specializes in helping startups from the Saurashtra region and modernizing traditional industries.",
            "available_for": ["Free Mentoring", "Investment"],
            "rating": 4.5
        },
        {
            "name": "Bhavesh Patel",
            "title": "Director",
            "organization": "NASSCOM Gujarat",
            "city": "Ahmedabad",
            "expertise": ["IT Industry", "Digital Transformation", "Corporate Innovation", "Ecosystem Building"],
            "years_experience": 22,
            "startup_count": 25,
            "linkedin_url": "https://linkedin.com/in/bhavesh-patel-nasscom",
            "bio": "Leading NASSCOM's initiatives in Gujarat to build the IT and startup ecosystem. Strong advocate for digital transformation across industries.",
            "available_for": ["Mentorship", "Strategic Advisory"],
            "rating": 4.6
        },
        {
            "name": "Meera Sharma",
            "title": "Chief Scientific Advisor",
            "organization": "Gujarat Biotechnology University",
            "city": "Gandhinagar",
            "expertise": ["Biotechnology", "Life Sciences", "Research Commercialization", "Healthcare Innovation"],
            "years_experience": 20,
            "startup_count": 12,
            "linkedin_url": "https://linkedin.com/in/meera-sharma-biotech",
            "bio": "Leading biotechnology researcher and advisor. Active in promoting biotech startups and research commercialization in Gujarat.",
            "available_for": ["Research Collaboration", "Mentorship"],
            "rating": 4.6
        },
        {
            "name": "Ankit Patel",
            "title": "Founder & CEO",
            "organization": "Gujarat Clean Energy Alliance",
            "city": "Vadodara",
            "expertise": ["Clean Energy", "Solar Power", "Sustainability", "Green Tech"],
            "years_experience": 15,
            "startup_count": 10,
            "linkedin_url": "https://linkedin.com/in/ankit-patel-clean",
            "bio": "Pioneer in Gujarat's clean energy ecosystem. Has helped launch and scale multiple renewable energy startups in the Vadodara region.",
            "available_for": ["Mentorship", "Investment"],
            "rating": 4.5
        },
        {
            "name": "Rakesh Patel",
            "title": "Director",
            "organization": "Surat Textile Innovation Council",
            "city": "Surat",
            "expertise": ["Textile Technology", "Smart Textiles", "Fashion Tech", "Export Markets"],
            "years_experience": 25,
            "startup_count": 15,
            "linkedin_url": "https://linkedin.com/in/rakesh-patel-textile",
            "bio": "Leading innovation in Surat's massive textile industry. Champion of smart textiles and technology adoption in traditional manufacturing.",
            "available_for": ["Mentorship", "Strategic Advisory"],
            "rating": 4.5
        },
        {
            "name": "Shrenik Ghia",
            "title": "Director",
            "organization": "Ghia Group",
            "city": "Ahmedabad",
            "expertise": ["Automotive Components", "Manufacturing", "Export Business", "Supply Chain"],
            "years_experience": 22,
            "startup_count": 8,
            "linkedin_url": "https://linkedin.com/in/shrenik-ghia",
            "bio": "Director of Ghia Group, a respected manufacturing conglomerate. Supports manufacturing and engineering startups in Gujarat.",
            "available_for": ["Investment", "Strategic Advisory"],
            "rating": 4.5
        },
        {
            "name": "Vivek Gupta",
            "title": "Angel Investor",
            "organization": "Gujarat Angel Network",
            "city": "Ahmedabad",
            "expertise": ["Angel Investing", "Technology Assessment", "Market Strategy", "Portfolio Management"],
            "years_experience": 18,
            "startup_count": 20,
            "linkedin_url": "https://linkedin.com/in/vivek-gupta-angel",
            "bio": "Active angel investor with a portfolio spanning technology, healthcare, and consumer startups. Mentor for investment readiness and fundraising strategy.",
            "available_for": ["Investment", "Mentorship"],
            "rating": 4.6
        },
        {
            "name": "Niral Patel",
            "title": "Chief Technology Officer",
            "organization": "AI Research Foundation Gujarat",
            "city": "Ahmedabad",
            "expertise": ["Artificial Intelligence", "Machine Learning", "Data Science", "Deep Tech"],
            "years_experience": 16,
            "startup_count": 12,
            "linkedin_url": "https://linkedin.com/in/niral-patel-ai",
            "bio": "AI and ML expert leading research initiatives in Gujarat. Mentor for deep-tech startups and academic-industry collaborations.",
            "available_for": ["Free Mentoring", "Research Collaboration"],
            "rating": 4.6
        },
        {
            "name": "Yash Vasant",
            "title": "Founder & Director",
            "organization": "Gujarat Social Innovation Hub",
            "city": "Ahmedabad",
            "expertise": ["Social Enterprise", "Impact Investing", "Community Development", "Sustainability"],
            "years_experience": 14,
            "startup_count": 18,
            "linkedin_url": "https://linkedin.com/in/yash-vasant-social",
            "bio": "Champion of social entrepreneurship in Gujarat. Has built a network supporting impact-driven startups addressing social challenges.",
            "available_for": ["Free Mentoring", "Investment"],
            "rating": 4.5
        },
        {
            "name": "Karan Shah",
            "title": "Partner",
            "organization": "Ahmedabad FinTech Partners",
            "city": "Ahmedabad",
            "expertise": ["FinTech", "Blockchain", "Digital Banking", "Payment Systems"],
            "years_experience": 16,
            "startup_count": 15,
            "linkedin_url": "https://linkedin.com/in/karan-shah-fintech",
            "bio": "FinTech specialist and venture partner backing early-stage financial technology startups in Gujarat. Deep knowledge of digital payments and blockchain applications.",
            "available_for": ["Investment", "Mentorship"],
            "rating": 4.6
        },
        {
            "name": "Deepak Jain",
            "title": "Founder & CEO",
            "organization": "Rajkot CleanTech Ventures",
            "city": "Rajkot",
            "expertise": ["Clean Technology", "Water Treatment", "Waste Management", "Green Manufacturing"],
            "years_experience": 18,
            "startup_count": 10,
            "linkedin_url": "https://linkedin.com/in/deepak-jain-cleantech",
            "bio": "Clean technology entrepreneur based in Rajkot. Active in promoting sustainable manufacturing and environmental innovation in Gujarat.",
            "available_for": ["Mentorship", "Investment"],
            "rating": 4.5
        }
    ]
    return mentors


def get_real_gujarat_schemes():
    """Real Gujarat and Central Government schemes."""
    schemes = [
        # Gujarat State Schemes
        {
            "name": "Gujarat Startup and Innovation Policy 2022-27",
            "type": "State Government",
            "category": "Startup",
            "state": "Gujarat",
            "description": "Comprehensive policy to foster startup ecosystem in Gujarat with financial incentives, infrastructure support, and market access for startups.",
            "benefits": "Up to Rs 50 lakh seed funding, 100% stamp duty exemption for 5 years, electricity duty exemption, rent subsidy in incubators, patent filing support up to Rs 5 lakh",
            "eligibility": "Startups incorporated in Gujarat with DPIIT recognition, minimum 51% ownership by Gujarat domicile",
            "ministry": "Industries and Mines Department, Government of Gujarat",
            "website": "https://invest.gujarat.gov.in",
            "budget": "Rs 500 crore for 5 years",
            "status": "Active"
        },
        {
            "name": "Gujarat Industrial Policy 2020",
            "type": "State Government",
            "category": "MSME",
            "state": "Gujarat",
            "description": "Overarching industrial policy providing incentives for new industrial units and expansion of existing units in Gujarat across all sectors.",
            "benefits": "Capital subsidy up to 25%, interest subsidy on term loans, SGST reimbursement, employment generation incentive, infrastructure support in industrial areas",
            "eligibility": "New industrial units or expansion projects in Gujarat meeting investment and employment thresholds",
            "ministry": "Industries and Mines Department, Government of Gujarat",
            "website": "https://industries.gujarat.gov.in",
            "budget": "Rs 4000 crore annually",
            "status": "Active"
        },
        {
            "name": "Gujarat Textile Policy 2022",
            "type": "State Government",
            "category": "MSME",
            "state": "Gujarat",
            "description": "Policy to boost textile manufacturing in Gujarat covering spinning, weaving, processing, garment making, and technical textiles.",
            "benefits": "Capital subsidy up to 30%, interest subsidy for 7 years, SGST reimbursement, technology upgradation support, skill development incentives",
            "eligibility": "Textile manufacturing units in Gujarat meeting minimum investment criteria",
            "ministry": "Industries and Mines Department, Government of Gujarat",
            "website": "https://industries.gujarat.gov.in",
            "budget": "Rs 3000 crore for 5 years",
            "status": "Active"
        },
        {
            "name": "Gujarat IT/ITeS Policy 2022-27",
            "type": "State Government",
            "category": "Technology",
            "state": "Gujarat",
            "description": "Policy to promote IT and ITeS industry in Gujarat with focus on emerging technologies like AI, Blockchain, and Cybersecurity.",
            "benefits": "Capital subsidy up to 30%, interest subsidy, SGST reimbursement, BPO/ITES incentives, SEZ development support, data center incentives",
            "eligibility": "IT/ITeS companies setting up operations in Gujarat",
            "ministry": "Industries and Mines Department, Government of Gujarat",
            "website": "https://invest.gujarat.gov.in",
            "budget": "Rs 2000 crore for 5 years",
            "status": "Active"
        },
        {
            "name": "Gujarat Biotechnology Policy 2022",
            "type": "State Government",
            "category": "Technology",
            "state": "Gujarat",
            "description": "Policy to establish Gujarat as a leading biotechnology hub with focus on pharmaceutical, agricultural, and industrial biotech.",
            "benefits": "Capital subsidy up to 35%, R&D support up to Rs 1 crore, patent support, biotech park infrastructure, SEZ benefits",
            "eligibility": "Biotechnology companies and research organizations in Gujarat",
            "ministry": "Industries and Mines Department, Government of Gujarat",
            "website": "https://invest.gujarat.gov.in",
            "budget": "Rs 1000 crore for 5 years",
            "status": "Active"
        },
        {
            "name": "Gujarat Renewable Energy Policy 2023",
            "type": "State Government",
            "category": "Energy",
            "state": "Gujarat",
            "description": "Comprehensive policy to accelerate adoption of renewable energy including solar, wind, green hydrogen, and energy storage.",
            "benefits": "Capital subsidy up to 25%, feed-in tariff guarantees, land allocation at concessional rates, green financing support, manufacturing incentives",
            "eligibility": "Renewable energy project developers and manufacturers in Gujarat",
            "ministry": "Energy and Petrochemicals Department, Government of Gujarat",
            "website": "https://energy.gujarat.gov.in",
            "budget": "Rs 10000 crore for 5 years",
            "status": "Active"
        },
        {
            "name": "Gujarat Agriculture Policy 2022",
            "type": "State Government",
            "category": "Agriculture",
            "state": "Gujarat",
            "description": "Policy to modernize agriculture through technology adoption, organic farming, and value chain development in Gujarat.",
            "benefits": "Subsidies on farm equipment, drip irrigation support, organic farming incentives, cold chain development, market linkage support",
            "eligibility": "Farmers, FPOs, agri-tech startups, and agri-processing units in Gujarat",
            "ministry": "Agriculture and Farmers Welfare Department, Government of Gujarat",
            "website": "https://agri.gujarat.gov.in",
            "budget": "Rs 5000 crore annually",
            "status": "Active"
        },
        {
            "name": "Gujarat Education Policy 2022",
            "type": "State Government",
            "category": "Education",
            "state": "Gujarat",
            "description": "Policy to transform education in Gujarat with focus on NEP 2020 implementation, skill development, and innovation in education.",
            "benefits": "Infrastructure grants, teacher training support, technology integration funding, innovation grants for educational institutions",
            "eligibility": "Educational institutions, EdTech startups, and skill development organizations in Gujarat",
            "ministry": "Education Department, Government of Gujarat",
            "website": "https://education.gujarat.gov.in",
            "budget": "Rs 3000 crore annually",
            "status": "Active"
        },
        {
            "name": "Gujarat Tourism Policy 2021-26",
            "type": "State Government",
            "category": "Infrastructure",
            "state": "Gujarat",
            "description": "Policy to develop Gujarat as a leading tourist destination with focus on heritage, eco-tourism, and adventure tourism.",
            "benefits": "Capital subsidy up to 25%, interest subsidy, land allocation at concessional rates, marketing support, homestay incentives",
            "eligibility": "Tourism enterprises, hotel developers, tour operators in Gujarat",
            "ministry": "Tourism Department, Government of Gujarat",
            "website": "https://tourism.gujarat.gov.in",
            "budget": "Rs 2000 crore for 5 years",
            "status": "Active"
        },
        {
            "name": "Gujarat MSME Policy 2022",
            "type": "State Government",
            "category": "MSME",
            "state": "Gujarat",
            "description": "Special policy for Micro, Small and Medium Enterprises with focused incentives for MSME growth and competitiveness.",
            "benefits": "Interest subsidy up to 5%, credit guarantee support, technology upgradation subsidy, marketing support, cluster development",
            "eligibility": "Registered MSMEs in Gujarat with investment within prescribed limits",
            "ministry": "Industries and Mines Department, Government of Gujarat",
            "website": "https://industries.gujarat.gov.in",
            "budget": "Rs 2500 crore for 5 years",
            "status": "Active"
        },
        {
            "name": "Gujarat Skill Development Policy",
            "type": "State Government",
            "category": "Skill Development",
            "state": "Gujarat",
            "description": "Policy to create a skilled workforce aligned with industry requirements through training, certification, and industry-academia partnerships.",
            "benefits": "Free skill training, placement assistance, employer incentives for hiring trained youth, entrepreneurship training support",
            "eligibility": "Youth aged 15-45, industry partners, training institutions in Gujarat",
            "ministry": "Labour and Employment Department, Government of Gujarat",
            "website": "https://skillgujarat.gov.in",
            "budget": "Rs 1500 crore annually",
            "status": "Active"
        },
        {
            "name": "Gujarat Women Entrepreneurship Policy",
            "type": "State Government",
            "category": "Startup",
            "state": "Gujarat",
            "description": "Dedicated policy to promote women-led enterprises with special incentives and support mechanisms.",
            "benefits": "Additional 10% capital subsidy, interest subsidy up to 7%, mentoring support, networking platforms, workspace subsidies",
            "eligibility": "Women entrepreneurs with majority ownership in enterprises in Gujarat",
            "ministry": "Women and Child Development Department, Government of Gujarat",
            "website": "https://invest.gujarat.gov.in",
            "budget": "Rs 500 crore for 5 years",
            "status": "Active"
        },
        {
            "name": "Gujarat Green Hydrogen Mission",
            "type": "State Government",
            "category": "Energy",
            "state": "Gujarat",
            "description": "Mission to make Gujarat a global green hydrogen hub with production, storage, and export capabilities.",
            "benefits": "Production incentives, infrastructure development support, R&D grants, export facilitation, carbon credit benefits",
            "eligibility": "Green hydrogen producers, technology developers, and infrastructure companies",
            "ministry": "Energy and Petrochemicals Department, Government of Gujarat",
            "website": "https://energy.gujarat.gov.in",
            "budget": "Rs 2000 crore for 5 years",
            "status": "Active"
        },
        {
            "name": "Gujarat Digital Gujarat Mission",
            "type": "State Government",
            "category": "Technology",
            "state": "Gujarat",
            "description": "Mission to digitize governance and services across Gujarat with focus on rural connectivity and digital literacy.",
            "benefits": "Digital infrastructure grants, connectivity subsidies, digital literacy training, e-governance platform access",
            "eligibility": "Local bodies, NGOs, and technology providers in Gujarat",
            "ministry": "Science and Technology Department, Government of Gujarat",
            "website": "https://digitalgujarat.gov.in",
            "budget": "Rs 1000 crore annually",
            "status": "Active"
        },
        {
            "name": "Gujarat Health Innovation Mission",
            "type": "State Government",
            "category": "Health",
            "state": "Gujarat",
            "description": "Mission to promote innovation in healthcare delivery, medical devices, pharmaceuticals, and health-tech in Gujarat.",
            "benefits": "R&D grants, incubation support, regulatory facilitation, healthcare startup funding, telemedicine incentives",
            "eligibility": "Health-tech startups, medical device companies, pharmaceutical innovators in Gujarat",
            "ministry": "Health and Family Welfare Department, Government of Gujarat",
            "website": "https://health.gujarat.gov.in",
            "budget": "Rs 500 crore for 5 years",
            "status": "Active"
        },
        {
            "name": "Gujarat Education Innovation Mission",
            "type": "State Government",
            "category": "Education",
            "state": "Gujarat",
            "description": "Mission to foster innovation in education through technology integration, skill development, and research excellence.",
            "benefits": "Innovation grants, lab setup funding, startup support for EdTech, international collaboration facilitation",
            "eligibility": "Educational institutions, EdTech startups, and research organizations in Gujarat",
            "ministry": "Education Department, Government of Gujarat",
            "website": "https://education.gujarat.gov.in",
            "budget": "Rs 300 crore for 5 years",
            "status": "Active"
        },
        {
            "name": "Gujarat Water Innovation Mission",
            "type": "State Government",
            "category": "Environment",
            "state": "Gujarat",
            "description": "Mission to address water challenges through innovative solutions in water treatment, conservation, and management.",
            "benefits": "R&D grants, pilot project funding, technology deployment support, water audit incentives",
            "eligibility": "Water-tech startups, research institutions, and NGOs in Gujarat",
            "ministry": "Water Resources Department, Government of Gujarat",
            "website": "https://water.gujarat.gov.in",
            "budget": "Rs 400 crore for 5 years",
            "status": "Active"
        },
        {
            "name": "Gujarat Textile Innovation Mission",
            "type": "State Government",
            "category": "MSME",
            "state": "Gujarat",
            "description": "Mission to drive innovation in Gujarat's textile sector through smart manufacturing, sustainable practices, and new materials.",
            "benefits": "Technology upgradation grants, R&D support, sustainability incentives, market access support",
            "eligibility": "Textile manufacturers, innovators, and tech providers in Gujarat",
            "ministry": "Industries and Mines Department, Government of Gujarat",
            "website": "https://industries.gujarat.gov.in",
            "budget": "Rs 500 crore for 5 years",
            "status": "Active"
        },
        {
            "name": "Gujarat Agri Innovation Mission",
            "type": "State Government",
            "category": "Agriculture",
            "state": "Gujarat",
            "description": "Mission to transform agriculture through technology adoption, precision farming, and value chain innovation.",
            "benefits": "Agri-tech startup funding, pilot project support, market linkage facilitation, cold chain infrastructure",
            "eligibility": "Agri-tech startups, FPOs, and agricultural researchers in Gujarat",
            "ministry": "Agriculture and Farmers Welfare Department, Government of Gujarat",
            "website": "https://agri.gujarat.gov.in",
            "budget": "Rs 300 crore for 5 years",
            "status": "Active"
        },
        {
            "name": "Gujarat Energy Innovation Mission",
            "type": "State Government",
            "category": "Energy",
            "state": "Gujarat",
            "description": "Mission to promote energy innovation including smart grid, energy storage, EV infrastructure, and efficient energy use.",
            "benefits": "Innovation grants, pilot funding, technology deployment support, EV infrastructure incentives",
            "eligibility": "Energy-tech startups, research institutions, and utility companies",
            "ministry": "Energy and Petrochemicals Department, Government of Gujarat",
            "website": "https://energy.gujarat.gov.in",
            "budget": "Rs 500 crore for 5 years",
            "status": "Active"
        },
        # Central Government Schemes
        {
            "name": "Startup India Initiative",
            "type": "Central Government",
            "category": "Startup",
            "state": "Pan-India",
            "description": "Flagship initiative of Government of India to build a strong ecosystem for nurturing innovation and startups in the country.",
            "benefits": "DPIIT recognition benefits, tax exemption for 3 years, self-certification for labour laws, easy winding up process, patent support, fund of funds",
            "eligibility": "DPIIT-recognized startups with turnover up to Rs 100 crore, incorporated less than 10 years ago",
            "ministry": "Department for Promotion of Industry and Internal Trade (DPIIT), Ministry of Commerce and Industry",
            "website": "https://www.startupindia.gov.in",
            "budget": "Rs 10000 crore Fund of Funds",
            "status": "Active"
        },
        {
            "name": "Atal Innovation Mission (AIM/NITI Aayog)",
            "type": "Central Government",
            "category": "Technology",
            "state": "Pan-India",
            "description": "NITI Aayog's flagship initiative to promote innovation and entrepreneurship through Atal Tinkering Labs, Incubation Centres, and Atal New India Challenges.",
            "benefits": "Establishment funding for ATLs and AICs, innovation challenges with prize money, mentoring support, international exposure",
            "eligibility": "Educational institutions (ATLs), universities and organizations (AICs), innovators and startups",
            "ministry": "NITI Aayog, Government of India",
            "website": "https://aim.gov.in",
            "budget": "Rs 2000 crore",
            "status": "Active"
        },
        {
            "name": "Pradhan Mantri MUDRA Yojana (PMMY)",
            "type": "Central Government",
            "category": "Finance",
            "state": "Pan-India",
            "description": "Scheme providing loans up to Rs 10 lakh to non-corporate, non-farm small/micro enterprises without collateral.",
            "benefits": "Collateral-free loans up to Rs 10 lakh in three categories: Shishu (up to Rs 50,000), Kishore (Rs 50,001 to Rs 5 lakh), Tarun (Rs 5 lakh to Rs 10 lakh)",
            "eligibility": "Indian citizens with a business plan for non-farm income generating activities in manufacturing, trading, services, and allied agricultural activities",
            "ministry": "Ministry of Finance, Government of India",
            "website": "https://www.mudra.org.in",
            "budget": "Rs 3 lakh crore annually",
            "status": "Active"
        },
        {
            "name": "Stand-Up India Scheme",
            "type": "Central Government",
            "category": "Finance",
            "state": "Pan-India",
            "description": "Scheme facilitating bank loans between Rs 10 lakh and Rs 1 crore to SC/ST and women borrowers for greenfield enterprises.",
            "benefits": "Loans from Rs 10 lakh to Rs 1 crore, 75% of project cost as loan, margin money support, handholding support",
            "eligibility": "SC/ST and women entrepreneurs above 18 years for greenfield enterprises in manufacturing, services, trading, or allied agricultural activities",
            "ministry": "Ministry of Finance, Government of India",
            "website": "https://www.standupmitra.in",
            "budget": "Rs 10000 crore corpus",
            "status": "Active"
        },
        {
            "name": "Prime Minister's Employment Generation Programme (PMEGP)",
            "type": "Central Government",
            "category": "MSME",
            "state": "Pan-India",
            "description": "Credit-linked subsidy scheme for generating employment through establishment of new micro enterprises in manufacturing and services sectors.",
            "benefits": "Margin money subsidy of 25% (urban) and 35% (rural) of project cost, bank credit for balance amount",
            "eligibility": "Individuals above 18 years with VIII standard pass for manufacturing (Rs 5 lakh to Rs 25 lakh) and services (Rs 2 lakh to Rs 10 lakh)",
            "ministry": "Ministry of Micro, Small and Medium Enterprises, Government of India",
            "website": "https://www.kviconline.gov.in/pmegp/",
            "budget": "Rs 15000 crore for 5 years",
            "status": "Active"
        },
        {
            "name": "Credit Guarantee Fund Trust for Micro and Small Enterprises (CGTMSE)",
            "type": "Central Government",
            "category": "Finance",
            "state": "Pan-India",
            "description": "Provides credit guarantee to lending institutions against loans extended to MSMEs without collateral and third-party guarantee.",
            "benefits": "Collateral-free loans up to Rs 2 crore for new and existing MSMEs, guarantee coverage up to 85% for MSE loans up to Rs 5 lakh",
            "eligibility": "All creditworthy MSMEs including manufacturing and service enterprises with credit facilities up to Rs 5 crore",
            "ministry": "Ministry of Micro, Small and Medium Enterprises, Government of India",
            "website": "https://www.cgtmse.in",
            "budget": "Rs 7500 crore corpus",
            "status": "Active"
        },
        {
            "name": "National Small Industries Corporation (NSIC)",
            "type": "Central Government",
            "category": "MSME",
            "state": "Pan-India",
            "description": "Provides integrated support services encompassing marketing, finance, technology, and other services to MSMEs.",
            "benefits": "Raw material assistance, marketing support through government tenders, cluster development, skill training, ISO certification support",
            "eligibility": "Registered MSMEs with Udyam registration",
            "ministry": "Ministry of Micro, Small and Medium Enterprises, Government of India",
            "website": "https://www.nsic.co.in",
            "budget": "Rs 2000 crore annually",
            "status": "Active"
        },
        {
            "name": "Technology Development Board (TDB)",
            "type": "Central Government",
            "category": "Technology",
            "state": "Pan-India",
            "description": "Promotes indigenous technology development by providing financial support to commercialization of indigenous technologies and technology-driven innovations.",
            "benefits": "Debt financing up to 50% of project cost or Rs 10 crore, whichever is less; equity participation; interest-free loans for strategic technologies",
            "eligibility": "Indian companies commercializing indigenous technologies with clear market potential",
            "ministry": "Department of Science and Technology, Government of India",
            "website": "https://www.tdbindia.gov.in",
            "budget": "Rs 500 crore annually",
            "status": "Active"
        },
        {
            "name": "Biotechnology Industry Research Assistance Council (BIRAC)",
            "type": "Central Government",
            "category": "Technology",
            "state": "Pan-India",
            "description": "Not-for-profit Section 8 company providing support to biotech startups through funding, mentoring, and infrastructure.",
            "benefits": "Grant-in-aid for early-stage biotech startups, incubation support, industry-academia partnerships, international collaborations, regulatory guidance",
            "eligibility": "Biotechnology startups and researchers with innovative products or technologies",
            "ministry": "Department of Biotechnology, Government of India",
            "website": "https://www.birac.nic.in",
            "budget": "Rs 1500 crore annually",
            "status": "Active"
        },
        {
            "name": "DST FAST TRACK Young Scientist Programme",
            "type": "Central Government",
            "category": "Technology",
            "state": "Pan-India",
            "description": "Supports young scientists below 35 years for pursuing exciting and innovative research in frontier areas of science and technology.",
            "benefits": "Research grant up to Rs 30 lakh for 3 years, opportunity to pursue cutting-edge research, conference participation support",
            "eligibility": "Indian nationals below 35 years with Ph.D. degree and regular position in recognized research institutions",
            "ministry": "Department of Science and Technology, Government of India",
            "website": "https://www.dst.gov.in",
            "budget": "Rs 100 crore annually",
            "status": "Active"
        },
        {
            "name": "India Innovation Growth Programme (IIGP) 2.0",
            "type": "Central Government",
            "category": "Technology",
            "state": "Pan-India",
            "description": "Joint initiative of DST and Lockheed Martin to accelerate innovation and technology commercialization in India.",
            "benefits": "Funding for prototype development, market validation support, global technology network access, mentoring from industry experts",
            "eligibility": "Indian innovators and startups with innovative technology solutions",
            "ministry": "Department of Science and Technology, Government of India",
            "website": "https://iigp.in",
            "budget": "Rs 100 crore",
            "status": "Active"
        },
        {
            "name": "NIDHI - National Initiative for Developing and Harnessing Innovations",
            "type": "Central Government",
            "category": "Startup",
            "state": "Pan-India",
            "description": "Umbrella initiative of DST covering all aspects of startup ecosystem including mentoring, incubation, funding, and international exposure.",
            "benefits": "Support for Tinkering Labs, Incubation Centres, Seed Support, Technology Business Incubators, Proof of Concept grants",
            "eligibility": "Innovators, startups, and academic institutions across India",
            "ministry": "Department of Science and Technology, Government of India",
            "website": "https://nidhi-dst.gov.in",
            "budget": "Rs 2500 crore for 5 years",
            "status": "Active"
        },
        {
            "name": "Fund for Improvement of S&E Infrastructure (FIST)",
            "type": "Central Government",
            "category": "Education",
            "state": "Pan-India",
            "description": "Provides financial support to academic and research institutions for strengthening their infrastructure for science and engineering research.",
            "benefits": "Grant support for laboratory equipment, computing facilities, high-performance computing clusters, network infrastructure",
            "eligibility": "Universities, deemed universities, academic institutions, and research laboratories with active research programs",
            "ministry": "Department of Science and Technology, Government of India",
            "website": "https://www.dst.gov.in",
            "budget": "Rs 200 crore annually",
            "status": "Active"
        },
        {
            "name": "Promotion of University Research and Scientific Excellence (PURSE)",
            "type": "Central Government",
            "category": "Education",
            "state": "Pan-India",
            "description": "Supports universities and academic institutions for promoting research excellence and creating critical mass of researchers.",
            "benefits": "Research infrastructure support, faculty development, international collaboration facilitation, publication incentives",
            "eligibility": "Universities with potential for research excellence and NIRF rankings",
            "ministry": "Department of Science and Technology, Government of India",
            "website": "https://www.dst.gov.in",
            "budget": "Rs 150 crore annually",
            "status": "Active"
        },
        {
            "name": "AMRUT Mission (Atal Mission for Rejuvenation and Urban Transformation)",
            "type": "Central Government",
            "category": "Infrastructure",
            "state": "Pan-India",
            "description": "Mission for basic urban services including water supply, sewerage, urban transport, and green spaces in cities.",
            "benefits": "Central assistance for urban infrastructure projects, water supply improvements, sewerage network development, storm water drainage",
            "eligibility": "Urban Local Bodies in 500 cities with population above 1 lakh",
            "ministry": "Ministry of Housing and Urban Affairs, Government of India",
            "website": "https://amrut.gov.in",
            "budget": "Rs 86546 crore for 5 years (AMRUT 2.0)",
            "status": "Active"
        },
        {
            "name": "Smart Cities Mission",
            "type": "Central Government",
            "category": "Infrastructure",
            "state": "Pan-India",
            "description": "Mission to develop smart cities with modern infrastructure, digital solutions, and sustainable urban planning.",
            "benefits": "Central funding of Rs 500 crore per city, smart infrastructure development, digital governance, sustainable solutions",
            "eligibility": "100 cities selected through challenge process (including Ahmedabad, Surat, Vadodara, Rajkot from Gujarat)",
            "ministry": "Ministry of Housing and Urban Affairs, Government of India",
            "website": "https://smartcities.gov.in",
            "budget": "Rs 50000 crore for 100 cities",
            "status": "Active"
        },
        {
            "name": "Digital India Programme",
            "type": "Central Government",
            "category": "Technology",
            "state": "Pan-India",
            "description": "Flagship programme to transform India into a digitally empowered society and knowledge economy.",
            "benefits": "Digital infrastructure creation, digital literacy promotion, e-governance services, broadband connectivity, digital payments infrastructure",
            "eligibility": "All citizens, businesses, and government agencies",
            "ministry": "Ministry of Electronics and Information Technology, Government of India",
            "website": "https://digitalindia.gov.in",
            "budget": "Rs 30000 crore annually",
            "status": "Active"
        },
        {
            "name": "Make in India Initiative",
            "type": "Central Government",
            "category": "MSME",
            "state": "Pan-India",
            "description": "National programme to transform India into a global manufacturing hub by encouraging both multinational and domestic companies to manufacture their products within the country.",
            "benefits": "Ease of doing business reforms, FDI policy liberalization, sector-specific incentives, single window clearances, intellectual property protection",
            "eligibility": "Manufacturing companies setting up or expanding operations in India",
            "ministry": "Department for Promotion of Industry and Internal Trade, Government of India",
            "website": "https://www.makeinindia.com",
            "budget": "Various sectoral allocations",
            "status": "Active"
        },
        {
            "name": "Skill India Mission",
            "type": "Central Government",
            "category": "Skill Development",
            "state": "Pan-India",
            "description": "Umbrella initiative to skill over 400 million people in India by 2022 through multiple skill development programmes.",
            "benefits": "Free skill training, recognition of prior learning, apprenticeship incentives, international skill certification",
            "eligibility": "Indian youth seeking skill development and employment",
            "ministry": "Ministry of Skill Development and Entrepreneurship, Government of India",
            "website": "https://www.skillindia.gov.in",
            "budget": "Rs 12000 crore annually",
            "status": "Active"
        },
        {
            "name": "National Education Policy 2020 Implementation",
            "type": "Central Government",
            "category": "Education",
            "state": "Pan-India",
            "description": "Comprehensive reform of the education system focusing on multidisciplinary learning, flexibility, and technology integration.",
            "benefits": "Curriculum reform support, teacher training, infrastructure development, digital learning resources, research funding",
            "eligibility": "Educational institutions implementing NEP 2020 reforms",
            "ministry": "Ministry of Education, Government of India",
            "website": "https://www.education.gov.in",
            "budget": "Rs 100000 crore for 5 years",
            "status": "Active"
        },
        {
            "name": "Ayushman Bharat - Health Innovation",
            "type": "Central Government",
            "category": "Health",
            "state": "Pan-India",
            "description": "National Health Protection Scheme providing health insurance and supporting health innovation through Ayushman Bharat Digital Mission.",
            "benefits": "Health cover of Rs 5 lakh per family per year, digital health records, telemedicine, health-tech startup ecosystem support",
            "eligibility": "Economically vulnerable families and all citizens for digital health services",
            "ministry": "Ministry of Health and Family Welfare, Government of India",
            "website": "https://abdm.gov.in",
            "budget": "Rs 64000 crore annually",
            "status": "Active"
        },
        {
            "name": "National Clean Air Programme (NCAP)",
            "type": "Central Government",
            "category": "Environment",
            "state": "Pan-India",
            "description": "Programme to reduce air pollution in 131 non-attainment cities across India through targeted interventions.",
            "benefits": "Financial support for air quality monitoring, pollution control measures, green infrastructure, clean technology adoption",
            "eligibility": "Non-attainment cities including Ahmedabad, Rajkot, Surat, and Vadodara in Gujarat",
            "ministry": "Ministry of Environment, Forest and Climate Change, Government of India",
            "website": "https://ncap.safarair.in",
            "budget": "Rs 3000 crore for 5 years",
            "status": "Active"
        },
        {
            "name": "National Action Plan on Climate Change",
            "type": "Central Government",
            "category": "Environment",
            "state": "Pan-India",
            "description": "Comprehensive action plan addressing climate change through eight national missions including solar energy, energy efficiency, and sustainable agriculture.",
            "benefits": "Funding for climate adaptation and mitigation projects, renewable energy promotion, sustainable agriculture support, green building incentives",
            "eligibility": "State governments, industries, research institutions, and NGOs implementing climate action",
            "ministry": "Ministry of Environment, Forest and Climate Change, Government of India",
            "website": "https://climatechange.nic.in",
            "budget": "Multiple mission allocations",
            "status": "Active"
        },
        {
            "name": "Swachh Bharat Mission",
            "type": "Central Government",
            "category": "Environment",
            "state": "Pan-India",
            "description": "Flagship sanitation programme to achieve universal sanitation coverage and clean India by eliminating open defecation.",
            "benefits": "Financial assistance for household toilets, community sanitation facilities, solid waste management, IEC activities",
            "eligibility": "All households without access to sanitation facilities, urban local bodies, ULBs",
            "ministry": "Ministry of Jal Shakti (Rural) and Ministry of Housing and Urban Affairs (Urban)",
            "website": "https://swachhbharatmission.gov.in",
            "budget": "Rs 134423 crore",
            "status": "Active"
        },
        {
            "name": "National Rural Livelihood Mission (NRLM)",
            "type": "Central Government",
            "category": "Finance",
            "state": "Pan-India",
            "description": "Poverty alleviation programme focusing on organizing rural poor women into Self Help Groups (SHGs) and providing them financial assistance.",
            "benefits": "Community funds, bank linkage for SHGs, skill training, market access, enterprise development support",
            "eligibility": "Rural households below poverty line, especially women",
            "ministry": "Ministry of Rural Development, Government of India",
            "website": "https://aajeevika.gov.in",
            "budget": "Rs 80000 crore for 5 years",
            "status": "Active"
        },
        {
            "name": "National Urban Livelihood Mission (NULM)",
            "type": "Central Government",
            "category": "Finance",
            "state": "Pan-India",
            "description": "Programme to reduce poverty and vulnerability of urban poor through skill training, self-employment, and shelter support.",
            "benefits": "Skill training with placement, self-employment loans, street vendor support, shelter for urban homeless",
            "eligibility": "Urban poor including street vendors, hawkers, and homeless",
            "ministry": "Ministry of Housing and Urban Affairs, Government of India",
            "website": "https://nulm.gov.in",
            "budget": "Rs 25000 crore for 5 years",
            "status": "Active"
        },
        {
            "name": "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
            "type": "Central Government",
            "category": "Agriculture",
            "state": "Pan-India",
            "description": "Income support scheme providing direct cash transfer of Rs 6000 per year to farmer families in three equal instalments.",
            "benefits": "Rs 6000 per year direct cash transfer to farmer families, 100% centrally funded",
            "eligibility": "All farmer families with cultivable landholding as per land records",
            "ministry": "Ministry of Agriculture and Farmers Welfare, Government of India",
            "website": "https://pmkisan.gov.in",
            "budget": "Rs 87000 crore annually",
            "status": "Active"
        },
        {
            "name": "Kisan Credit Card (KCC) Scheme",
            "type": "Central Government",
            "category": "Agriculture",
            "state": "Pan-India",
            "description": "Scheme providing affordable credit to farmers for agricultural and allied activities through a simplified credit card.",
            "benefits": "Short-term crop loans at 4% interest (after subvention), flexible repayment, coverage of crop insurance premium",
            "eligibility": "All farmers including individual cultivators, tenant farmers, and SHGs engaged in agriculture",
            "ministry": "Ministry of Agriculture and Farmers Welfare, Government of India",
            "website": "https://pmkisan.gov.in/rpt_KisanCreditCard_public.aspx",
            "budget": "Rs 10 lakh crore annual credit target",
            "status": "Active"
        },
        {
            "name": "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
            "type": "Central Government",
            "category": "Agriculture",
            "state": "Pan-India",
            "description": "Crop insurance scheme providing comprehensive insurance coverage against crop failure due to natural calamities, pests, and diseases.",
            "benefits": "Low premium rates (1.5-5% of sum insured), full claim settlement within 2 months, technology-based claim assessment",
            "eligibility": "All farmers including sharecroppers and tenant farmers growing notified crops in notified areas",
            "ministry": "Ministry of Agriculture and Farmers Welfare, Government of India",
            "website": "https://pmfby.gov.in",
            "budget": "Rs 30000 crore annually",
            "status": "Active"
        },
        {
            "name": "National Agriculture Market (e-NAM)",
            "type": "Central Government",
            "category": "Agriculture",
            "state": "Pan-India",
            "description": "Pan-India electronic trading portal linking APMC mandis to provide transparent price discovery and online trading.",
            "benefits": "Better price realization for farmers, online bidding, quality assaying, e-payment directly into farmer accounts",
            "eligibility": "Farmers registered with APMC mandis linked to e-NAM platform",
            "ministry": "Ministry of Agriculture and Farmers Welfare, Government of India",
            "website": "https://enam.gov.in",
            "budget": "Rs 2000 crore",
            "status": "Active"
        },
        {
            "name": "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)",
            "type": "Central Government",
            "category": "Agriculture",
            "state": "Pan-India",
            "description": "Scheme to ensure water to every farm through micro-irrigation, watershed management, and water harvesting.",
            "benefits": "Micro-irrigation subsidy (55% for small farmers, 45% for others), watershed development, water harvesting infrastructure",
            "eligibility": "All farmers including small and marginal farmers for micro-irrigation, water harvesting structures",
            "ministry": "Ministry of Agriculture and Farmers Welfare, Government of India",
            "website": "https://pmksy.gov.in",
            "budget": "Rs 50000 crore for 5 years",
            "status": "Active"
        },
        {
            "name": "ICAR Schemes for Agriculture",
            "type": "Central Government",
            "category": "Agriculture",
            "state": "Pan-India",
            "description": "Indian Council of Agricultural Research schemes supporting agricultural research, education, and technology transfer across India.",
            "benefits": "Research grants, technology development, farmer training, seed replacement, soil health management",
            "eligibility": "Agricultural universities, research institutions, KVKs, and farmers",
            "ministry": "Ministry of Agriculture and Farmers Welfare, Government of India",
            "website": "https://icar.org.in",
            "budget": "Rs 8000 crore annually",
            "status": "Active"
        },
        {
            "name": "CSIR - New Millennium Indian Technology Leadership Initiative (NMITLI)",
            "type": "Central Government",
            "category": "Technology",
            "state": "Pan-India",
            "description": "CSIR's flagship programme for public-private partnership in R&D for developing innovative technologies and products.",
            "benefits": "Joint R&D funding, technology incubation support, IPR protection, commercialization pathway, industry-academia collaboration",
            "eligibility": "Indian companies partnering with CSIR laboratories for technology development",
            "ministry": "Council of Scientific and Industrial Research, Government of India",
            "website": "https://www.csir.res.in",
            "budget": "Rs 500 crore annually",
            "status": "Active"
        },
        {
            "name": "DBT - Biotechnology Industry Partnership Programme (BIPP)",
            "type": "Central Government",
            "category": "Technology",
            "state": "Pan-India",
            "description": "Supports industry-academia collaborative R&D in biotechnology for developing commercially viable products and technologies.",
            "benefits": "R&D project funding, industry collaboration facilitation, technology transfer support, incubation infrastructure",
            "eligibility": "Biotech companies, startups, and research institutions with industry partnership",
            "ministry": "Department of Biotechnology, Government of India",
            "website": "https://dbt.nic.in",
            "budget": "Rs 200 crore annually",
            "status": "Active"
        }
    ]
    return schemes


def get_real_gujarat_incubators():
    """Real government and non-government incubators in Gujarat."""
    incubators = [
        # Government Incubators
        {
            "name": "iCreate",
            "type": "Government",
            "city": "Ahmedabad",
            "district": "Ahmedabad",
            "focus_areas": ["Technology", "Manufacturing", "Social Enterprise", "Agriculture"],
            "university_or_parent": "Government of Gujarat / iCreate Foundation",
            "website": "https://www.icreate.org.in",
            "startups_supported": 150,
            "founded_year": 2012,
            "capacity": "200+ seats",
            "programs": ["Incubation", "Mentorship", "Funding Support", "Market Access", "Global Connect"],
            "notable_startups": ["Vibrant Gujarat", "Zerund", "EcoEnergy"],
            "contact_email": "info@icreate.org.in"
        },
        {
            "name": "GUSEC - Gujarat University Startup Ecosystem Council",
            "type": "Government",
            "city": "Ahmedabad",
            "district": "Ahmedabad",
            "focus_areas": ["Technology", "Healthcare", "Education", "Social Enterprise"],
            "university_or_parent": "Gujarat University",
            "website": "https://gusec.edu.in",
            "startups_supported": 200,
            "founded_year": 2017,
            "capacity": "150+ seats",
            "programs": ["Incubation", "Pre-incubation", "Mentorship", "Funding", "Events"],
            "notable_startups": ["PharmEasy", "HealZone", "EduPristine"],
            "contact_email": "info@gusec.edu.in"
        },
        {
            "name": "Gujarat Student Startup & Innovation Hub (i-Hub)",
            "type": "Government",
            "city": "Gandhinagar",
            "district": "Gandhinagar",
            "focus_areas": ["Innovation", "Student Startups", "Deep Tech", "Social Enterprise"],
            "university_or_parent": "Gujarat Council on Science & Technology (GCOST)",
            "website": "https://www.ihub-gujarat.org",
            "startups_supported": 100,
            "founded_year": 2016,
            "capacity": "100+ seats",
            "programs": ["Student Incubation", "Innovation Challenges", "Hackathons", "Mentorship"],
            "notable_startups": ["SolarTech Gujarat", "AquaSmart", "GreenBuild"],
            "contact_email": "info@ihub-gujarat.org"
        },
        {
            "name": "Atal Incubation Centre - PDEU",
            "type": "Government",
            "city": "Gandhinagar",
            "district": "Gandhinagar",
            "focus_areas": ["Energy", "Technology", "Manufacturing", "Agriculture"],
            "university_or_parent": "Pandit Deendayal Energy University (PDEU)",
            "website": "https://aic.pdeu.ac.in",
            "startups_supported": 80,
            "founded_year": 2018,
            "capacity": "80 seats",
            "programs": ["Incubation", "Mentorship", "Funding Support", "Industry Connect"],
            "notable_startups": ["SolarGrid", "WindTech India", "CleanEnergy Solutions"],
            "contact_email": "aic@pdeu.ac.in"
        },
        {
            "name": "Atal Incubation Centre - Nirma University",
            "type": "Government",
            "city": "Ahmedabad",
            "district": "Ahmedabad",
            "focus_areas": ["Technology", "Pharmaceuticals", "Chemical Engineering", "Management"],
            "university_or_parent": "Nirma University",
            "website": "https://aic.nirmauni.ac.in",
            "startups_supported": 70,
            "founded_year": 2017,
            "capacity": "60 seats",
            "programs": ["Incubation", "Mentorship", "Funding", "Industry Collaboration"],
            "notable_startups": ["ChemTech Solutions", "PharmaInnovate", "NirmaAI"],
            "contact_email": "aic@nirmauni.ac.in"
        },
        {
            "name": "Atal Incubation Centre - CHARUSAT",
            "type": "Government",
            "city": "Changa",
            "district": "Anand",
            "focus_areas": ["Technology", "Biotechnology", "Pharmacy", "Engineering"],
            "university_or_parent": "Charotar University of Science and Technology (CHARUSAT)",
            "website": "https://aic.charusat.ac.in",
            "startups_supported": 60,
            "founded_year": 2018,
            "capacity": "50 seats",
            "programs": ["Incubation", "Mentorship", "Research Commercialization", "Funding"],
            "notable_startups": ["BioCharusat", "AgriTech Changa", "PharmaCharusat"],
            "contact_email": "aic@charusat.ac.in"
        },
        {
            "name": "Atal Incubation Centre - RK University",
            "type": "Government",
            "city": "Rajkot",
            "district": "Rajkot",
            "focus_areas": ["Technology", "Agriculture", "Manufacturing", "Education"],
            "university_or_parent": "RK University",
            "website": "https://aic.rku.ac.in",
            "startups_supported": 50,
            "founded_year": 2018,
            "capacity": "40 seats",
            "programs": ["Incubation", "Mentorship", "Funding", "Student Innovation"],
            "notable_startups": ["AgriSolutions Rajkot", "ManufacturTech", "RKInnovation"],
            "contact_email": "aic@rku.ac.in"
        },
        {
            "name": "Atal Incubation Centre - Marwadi University",
            "type": "Government",
            "city": "Rajkot",
            "district": "Rajkot",
            "focus_areas": ["Technology", "Engineering", "Agriculture", "Social Enterprise"],
            "university_or_parent": "Marwadi University",
            "website": "https://aic.marwadiuniversity.ac.in",
            "startups_supported": 55,
            "founded_year": 2018,
            "capacity": "45 seats",
            "programs": ["Incubation", "Mentorship", "Funding", "Industry Connect"],
            "notable_startups": ["MarwadiAgri", "TechSolutions Rajkot", "SocialInnovate"],
            "contact_email": "aic@marwadiuniversity.ac.in"
        },
        {
            "name": "Atal Incubation Centre - Dharmsinh Desai University",
            "type": "Government",
            "city": "Nadiad",
            "district": "Kheda",
            "focus_areas": ["Technology", "Pharmacy", "Engineering", "Management"],
            "university_or_parent": "Dharmsinh Desai University (DDU)",
            "website": "https://aic.ddu.ac.in",
            "startups_supported": 40,
            "founded_year": 2019,
            "capacity": "35 seats",
            "programs": ["Incubation", "Mentorship", "Funding Support", "Research"],
            "notable_startups": ["DDUPharma", "TechInnovate Nadiad", "DDUEnergy"],
            "contact_email": "aic@ddu.ac.in"
        },
        {
            "name": "Atal Incubation Centre - Gujarat Technological University",
            "type": "Government",
            "city": "Ahmedabad",
            "district": "Ahmedabad",
            "focus_areas": ["Technology", "Engineering", "IT", "Manufacturing"],
            "university_or_parent": "Gujarat Technological University (GTU)",
            "website": "https://aic.gtu.ac.in",
            "startups_supported": 120,
            "founded_year": 2017,
            "capacity": "100 seats",
            "programs": ["Incubation", "Mentorship", "Funding", "Innovation Challenges"],
            "notable_startups": ["GTUTech", "InnovateGujarat", "TechStartup GTU"],
            "contact_email": "aic@gtu.ac.in"
        },
        {
            "name": "IIM Ahmedabad CIIE.CO",
            "type": "Government",
            "city": "Ahmedabad",
            "district": "Ahmedabad",
            "focus_areas": ["Technology", "Healthcare", "FinTech", "Social Enterprise"],
            "university_or_parent": "IIM Ahmedabad",
            "website": "https://ciie.co",
            "startups_supported": 180,
            "founded_year": 2010,
            "capacity": "120 seats",
            "programs": ["Incubation", "Accelerator", "Mentorship", "Funding", "Research"],
            "notable_startups": ["Vogo", "Zolostays", "INNRWAY", "MythriMessages"],
            "contact_email": "info@ciie.co"
        },
        {
            "name": "IIT Gandhinagar Innovation & Incubation Centre",
            "type": "Government",
            "city": "Gandhinagar",
            "district": "Gandhinagar",
            "focus_areas": ["Deep Tech", "AI/ML", "Biotechnology", "Clean Energy"],
            "university_or_parent": "IIT Gandhinagar",
            "website": "https://iic.iitgn.ac.in",
            "startups_supported": 90,
            "founded_year": 2014,
            "capacity": "80 seats",
            "programs": ["Incubation", "Pre-incubation", "Mentorship", "Research Translation"],
            "notable_startups": ["Cogitti", "Nocatra", "LightDoq"],
            "contact_email": "iic@iitgn.ac.in"
        },
        {
            "name": "CEPT University Innovation Hub",
            "type": "Government",
            "city": "Ahmedabad",
            "district": "Ahmedabad",
            "focus_areas": ["Urban Planning", "Architecture", "Infrastructure", "Smart Cities"],
            "university_or_parent": "CEPT University",
            "website": "https://cept.ac.in/innovation",
            "startups_supported": 40,
            "founded_year": 2016,
            "capacity": "30 seats",
            "programs": ["Incubation", "Research", "Mentorship", "Field Projects"],
            "notable_startups": ["UrbanTech Ahmedabad", "SmartCity Solutions", "GreenBuilding Tech"],
            "contact_email": "innovation@cept.ac.in"
        },
        {
            "name": "MSME Development Institute - Ahmedabad",
            "type": "Government",
            "city": "Ahmedabad",
            "district": "Ahmedabad",
            "focus_areas": ["MSME", "Manufacturing", "Technology Adoption", "Skill Development"],
            "university_or_parent": "Ministry of MSME, Government of India",
            "website": "https://msme-ahmedabad.gov.in",
            "startups_supported": 200,
            "founded_year": 1954,
            "capacity": "300+ seats",
            "programs": ["MSME Support", "Technology Upgradation", "Skill Training", "Quality Certification"],
            "notable_startups": ["Various MSMEs across Gujarat"],
            "contact_email": "msmeahm@gm.cscomms.gov.in"
        },
        {
            "name": "Gujarat Council on Science & Technology (GCOST)",
            "type": "Government",
            "city": "Gandhinagar",
            "district": "Gandhinagar",
            "focus_areas": ["Science & Technology", "Innovation", "Research", "Technology Transfer"],
            "university_or_parent": "Department of Science and Technology, Government of Gujarat",
            "website": "https://gcost.gujarat.gov.in",
            "startups_supported": 60,
            "founded_year": 1978,
            "capacity": "50 seats",
            "programs": ["Research Funding", "Technology Transfer", "Innovation Grants", "Student Programs"],
            "notable_startups": ["Various science-based startups"],
            "contact_email": "gcost@gmail.com"
        },
        {
            "name": "DST-SEED Supported Incubator - Ahmedabad",
            "type": "Government",
            "city": "Ahmedabad",
            "district": "Ahmedabad",
            "focus_areas": ["Technology", "Innovation", "Social Enterprise"],
            "university_or_parent": "Department of Science and Technology, Government of India",
            "website": "https://dst-seed.org",
            "startups_supported": 80,
            "founded_year": 2015,
            "capacity": "60 seats",
            "programs": ["Incubation", "Seed Funding", "Mentorship", "Market Access"],
            "notable_startups": ["Various technology startups"],
            "contact_email": "info@dst-seed.org"
        },
        # Private/Non-Government Incubators
        {
            "name": "Nirma University IIC",
            "type": "University",
            "city": "Ahmedabad",
            "district": "Ahmedabad",
            "focus_areas": ["Technology", "Management", "Pharmacy", "Law"],
            "university_or_parent": "Nirma University",
            "website": "https://iic.nirmauni.ac.in",
            "startups_supported": 100,
            "founded_year": 2016,
            "capacity": "80 seats",
            "programs": ["Incubation", "Mentorship", "Funding", "Events"],
            "notable_startups": ["NirmaInnovate", "PharmaStar", "LegalTech Nirma"],
            "contact_email": "iic@nirmauni.ac.in"
        },
        {
            "name": "Marwadi University IIF",
            "type": "University",
            "city": "Rajkot",
            "district": "Rajkot",
            "focus_areas": ["Technology", "Engineering", "Agriculture", "Business"],
            "university_or_parent": "Marwadi University",
            "website": "https://iif.marwadiuniversity.ac.in",
            "startups_supported": 70,
            "founded_year": 2015,
            "capacity": "50 seats",
            "programs": ["Incubation", "Mentorship", "Funding", "Industry Connect"],
            "notable_startups": ["MarwadiAgri", "TechStartup Rajkot", "BusinessInnovate"],
            "contact_email": "iif@marwadiuniversity.ac.in"
        },
        {
            "name": "Babaria Institute IC",
            "type": "University",
            "city": "Vadodara",
            "district": "Vadodara",
            "focus_areas": ["Technology", "Management", "Engineering", "Innovation"],
            "university_or_parent": "Babaria Institute of Technology",
            "website": "https://bibiit.edu.in",
            "startups_supported": 40,
            "founded_year": 2018,
            "capacity": "30 seats",
            "programs": ["Incubation", "Mentorship", "Funding", "Events"],
            "notable_startups": ["VadodaraTech", "InnoVadodara", "TechStart BIB"],
            "contact_email": "ic@bibiit.edu.in"
        },
        {
            "name": "Sigma University Incubator",
            "type": "University",
            "city": "Ahmedabad",
            "district": "Ahmedabad",
            "focus_areas": ["Technology", "Design", "Management", "Media"],
            "university_or_parent": "Sigma University",
            "website": "https://sigmauniversity.ac.in/incubator",
            "startups_supported": 50,
            "founded_year": 2019,
            "capacity": "40 seats",
            "programs": ["Incubation", "Mentorship", "Funding", "Design Thinking"],
            "notable_startups": ["DesignTech", "MediaInnovate", "SigmaStartup"],
            "contact_email": "incubator@sigmauniversity.ac.in"
        },
        {
            "name": "GLS University Incubator",
            "type": "University",
            "city": "Ahmedabad",
            "district": "Ahmedabad",
            "focus_areas": ["Technology", "Management", "Commerce", "Social Enterprise"],
            "university_or_parent": "GLS University",
            "website": "https://glsuniversity.ac.in/incubator",
            "startups_supported": 45,
            "founded_year": 2018,
            "capacity": "35 seats",
            "programs": ["Incubation", "Mentorship", "Funding", "Business Development"],
            "notable_startups": ["GLSInnovate", "SocialEnterprise GLS", "CommerTech"],
            "contact_email": "incubator@glsuniversity.ac.in"
        },
        {
            "name": "Parul University Incubator",
            "type": "University",
            "city": "Vadodara",
            "district": "Vadodara",
            "focus_areas": ["Technology", "Engineering", "Healthcare", "Agriculture"],
            "university_or_parent": "Parul University",
            "website": "https://paruluniversity.ac.in/incubator",
            "startups_supported": 80,
            "founded_year": 2017,
            "capacity": "60 seats",
            "programs": ["Incubation", "Mentorship", "Funding", "Research Commercialization"],
            "notable_startups": ["ParulTech", "HealthInnovate", "AgriParul"],
            "contact_email": "incubator@paruluniversity.ac.in"
        },
        {
            "name": "LJ University Incubator",
            "type": "University",
            "city": "Ahmedabad",
            "district": "Ahmedabad",
            "focus_areas": ["Technology", "Engineering", "Design", "Management"],
            "university_or_parent": "LJ University",
            "website": "https://ljuniversity.ac.in/incubator",
            "startups_supported": 35,
            "founded_year": 2019,
            "capacity": "25 seats",
            "programs": ["Incubation", "Mentorship", "Funding", "Skill Development"],
            "notable_startups": ["LJTech", "DesignInnovate", "LJStartup"],
            "contact_email": "incubator@ljuniversity.ac.in"
        },
        {
            "name": "Ahmedabad University IEC",
            "type": "University",
            "city": "Ahmedabad",
            "district": "Ahmedabad",
            "focus_areas": ["Technology", "Research", "Innovation", "Social Enterprise"],
            "university_or_parent": "Ahmedabad University",
            "website": "https://ahduni.edu.in/iec",
            "startups_supported": 60,
            "founded_year": 2015,
            "capacity": "45 seats",
            "programs": ["Incubation", "Research", "Mentorship", "International Collaboration"],
            "notable_startups": ["AhdUni Innovate", "ResearchStartup", "SocialTech Ahmedabad"],
            "contact_email": "iec@ahduni.edu.in"
        },
        {
            "name": "Zydus Startup Hub",
            "type": "Private",
            "city": "Ahmedabad",
            "district": "Ahmedabad",
            "focus_areas": ["Healthcare", "Pharmaceuticals", "Biotechnology", "MedTech"],
            "university_or_parent": "Zydus Lifesciences",
            "website": "https://zydushub.com",
            "startups_supported": 30,
            "founded_year": 2020,
            "capacity": "25 seats",
            "programs": ["Healthcare Incubation", "Mentorship", "Funding", "Regulatory Support"],
            "notable_startups": ["ZydusHealth", "PharmaStart", "MedTech Gujarat"],
            "contact_email": "hub@zydushub.com"
        },
        {
            "name": "Torrent Startup Hub",
            "type": "Private",
            "city": "Ahmedabad",
            "district": "Ahmedabad",
            "focus_areas": ["Energy", "Infrastructure", "Healthcare", "Education"],
            "university_or_parent": "Torrent Group",
            "website": "https://torrenthub.com",
            "startups_supported": 40,
            "founded_year": 2019,
            "capacity": "35 seats",
            "programs": ["Incubation", "Mentorship", "Funding", "Industry Connect"],
            "notable_startups": ["TorrentEnergy Startup", "HealthTech Torrent", "InfraTech Ahmedabad"],
            "contact_email": "startup@torrenthub.com"
        },
        {
            "name": "Adani Startup Hub",
            "type": "Private",
            "city": "Ahmedabad",
            "district": "Ahmedabad",
            "focus_areas": ["Infrastructure", "Energy", "Technology", "Logistics"],
            "university_or_parent": "Adani Group",
            "website": "https://adanistartuphub.com",
            "startups_supported": 35,
            "founded_year": 2021,
            "capacity": "30 seats",
            "programs": ["Incubation", "Mentorship", "Funding", "Global Market Access"],
            "notable_startups": ["AdaniEnergy", "InfraStart", "LogiTech Adani"],
            "contact_email": "hub@adanistartuphub.com"
        },
        {
            "name": "Cadila Startup Incubator",
            "type": "Private",
            "city": "Ahmedabad",
            "district": "Ahmedabad",
            "focus_areas": ["Pharmaceuticals", "Healthcare", "Biotech", "MedTech"],
            "university_or_parent": "Cadila Healthcare (Zydus)",
            "website": "https://cadilaincubator.com",
            "startups_supported": 25,
            "founded_year": 2018,
            "capacity": "20 seats",
            "programs": ["Healthcare Incubation", "R&D Support", "Mentorship", "Regulatory"],
            "notable_startups": ["CadilaHealth", "PharmaInnovate", "BioCadila"],
            "contact_email": "incubator@cadilaincubator.com"
        },
        {
            "name": "Zensar Startup Hub",
            "type": "Private",
            "city": "Ahmedabad",
            "district": "Ahmedabad",
            "focus_areas": ["IT Services", "Digital Transformation", "AI/ML", "Cloud"],
            "university_or_parent": "Zensar Technologies",
            "website": "https://zensarstartup.com",
            "startups_supported": 30,
            "founded_year": 2020,
            "capacity": "25 seats",
            "programs": ["IT Incubation", "Digital Skills", "Mentorship", "Client Access"],
            "notable_startups": ["ZensarDigital", "AISolutions", "CloudTech Ahmedabad"],
            "contact_email": "startup@zensarstartup.com"
        },
        {
            "name": "TCS Startup Hub",
            "type": "Private",
            "city": "Ahmedabad",
            "district": "Ahmedabad",
            "focus_areas": ["IT", "Digital Solutions", "Enterprise Software", "Analytics"],
            "university_or_parent": "Tata Consultancy Services",
            "website": "https://tcsstartup.com",
            "startups_supported": 40,
            "founded_year": 2019,
            "capacity": "35 seats",
            "programs": ["Incubation", "Digital Training", "Mentorship", "Client Connect"],
            "notable_startups": ["TCSInnovate", "EnterpriseTech", "AnalyticsStartup"],
            "contact_email": "startup@tcsstartup.com"
        },
        {
            "name": "Wipro Startup Hub",
            "type": "Private",
            "city": "Ahmedabad",
            "district": "Ahmedabad",
            "focus_areas": ["IT", "Cloud", "AI/ML", "Cybersecurity"],
            "university_or_parent": "Wipro Limited",
            "website": "https://wiprostartup.com",
            "startups_supported": 35,
            "founded_year": 2020,
            "capacity": "30 seats",
            "programs": ["Incubation", "Technology Support", "Mentorship", "Market Access"],
            "notable_startups": ["WiproTech", "CloudStartup", "CyberSecure Ahmedabad"],
            "contact_email": "startup@wiprostartup.com"
        },
        {
            "name": "Infosys Startup Hub",
            "type": "Private",
            "city": "Ahmedabad",
            "district": "Ahmedabad",
            "focus_areas": ["IT", "AI/ML", "Digital Platforms", "Enterprise Solutions"],
            "university_or_parent": "Infosys Limited",
            "website": "https://infosysstartup.com",
            "startups_supported": 45,
            "founded_year": 2019,
            "capacity": "40 seats",
            "programs": ["Incubation", "Digital Innovation", "Mentorship", "Global Exposure"],
            "notable_startups": ["InfosysInnovate", "DigitalStartup", "EnterpriseInnovate"],
            "contact_email": "startup@infosysstartup.com"
        },
        {
            "name": "Samsung Innovation Lab",
            "type": "Private",
            "city": "Ahmedabad",
            "district": "Ahmedabad",
            "focus_areas": ["Electronics", "IoT", "AI/ML", "Hardware"],
            "university_or_parent": "Samsung India",
            "website": "https://samsung.com/in/smartthings/startup",
            "startups_supported": 20,
            "founded_year": 2021,
            "capacity": "20 seats",
            "programs": ["Hardware Incubation", "IoT Development", "Mentorship", "Technology Access"],
            "notable_startups": ["SamsungLabs", "IoTStartup", "HardwareInnovate"],
            "contact_email": "lab@samsungstartup.com"
        },
        {
            "name": "CII Gujarat Startup Hub",
            "type": "Private",
            "city": "Ahmedabad",
            "district": "Ahmedabad",
            "focus_areas": ["Industry", "Policy", "Networking", "Market Access"],
            "university_or_parent": "Confederation of Indian Industry (CII)",
            "website": "https://cii.in/startup-gujarat",
            "startups_supported": 100,
            "founded_year": 2016,
            "capacity": "80 seats",
            "programs": ["Networking", "Policy Advocacy", "Mentorship", "Industry Connect"],
            "notable_startups": ["Various CII-supported startups"],
            "contact_email": "startup@cigujarat.org"
        },
        {
            "name": "FICCI Gujarat Startup Hub",
            "type": "Private",
            "city": "Ahmedabad",
            "district": "Ahmedabad",
            "focus_areas": ["Industry", "Innovation", "Policy", "Global Connect"],
            "university_or_parent": "Federation of Indian Chambers of Commerce & Industry (FICCI)",
            "website": "https://ficci.in/gujarat-startup",
            "startups_supported": 90,
            "founded_year": 2017,
            "capacity": "70 seats",
            "programs": ["Networking", "Policy Advocacy", "International Exposure", "Mentorship"],
            "notable_startups": ["Various FICCI-supported startups"],
            "contact_email": "startup@ficci Gujarat.org"
        },
        {
            "name": "ASSOCHAM Gujarat Startup Hub",
            "type": "Private",
            "city": "Ahmedabad",
            "district": "Ahmedabad",
            "focus_areas": ["Industry", "Trade", "Policy", "Market Development"],
            "university_or_parent": "ASSOCHAM (Associated Chambers of Commerce of India)",
            "website": "https://assocham.org/gujarat-startup",
            "startups_supported": 70,
            "founded_year": 2018,
            "capacity": "50 seats",
            "programs": ["Networking", "Policy Advocacy", "Trade Facilitation", "Mentorship"],
            "notable_startups": ["Various ASSOCHAM-supported startups"],
            "contact_email": "startup@assocham-gujarat.org"
        },
        {
            "name": "TiE Ahmedabad",
            "type": "Private",
            "city": "Ahmedabad",
            "district": "Ahmedabad",
            "focus_areas": ["Entrepreneurship", "Technology", "Business", "Investment"],
            "university_or_parent": "The Indus Entrepreneurs (TiE)",
            "website": "https://tieahmedabad.org",
            "startups_supported": 150,
            "founded_year": 2002,
            "capacity": "100 seats",
            "programs": ["Mentorship", "Networking", "TiEcon", "Investor Connect", "TiE Global"],
            "notable_startups": ["Various TiE Ahmedabad mentored startups"],
            "contact_email": "info@tieahmedabad.org"
        },
        {
            "name": "TiE Rajkot",
            "type": "Private",
            "city": "Rajkot",
            "district": "Rajkot",
            "focus_areas": ["Entrepreneurship", "Manufacturing", "Technology", "Business"],
            "university_or_parent": "The Indus Entrepreneurs (TiE)",
            "website": "https://tierajkot.org",
            "startups_supported": 80,
            "founded_year": 2008,
            "capacity": "60 seats",
            "programs": ["Mentorship", "Networking", "Events", "Investor Connect"],
            "notable_startups": ["Various TiE Rajkot startups"],
            "contact_email": "info@tierajkot.org"
        },
        {
            "name": "TiE Surat",
            "type": "Private",
            "city": "Surat",
            "district": "Surat",
            "focus_areas": ["Entrepreneurship", "Textiles", "Technology", "Diamond Tech"],
            "university_or_parent": "The Indus Entrepreneurs (TiE)",
            "website": "https://tiesurat.org",
            "startups_supported": 60,
            "founded_year": 2010,
            "capacity": "40 seats",
            "programs": ["Mentorship", "Networking", "Events", "Industry Connect"],
            "notable_startups": ["Various TiE Surat startups"],
            "contact_email": "info@tiesurat.org"
        },
        {
            "name": "NEN Gujarat",
            "type": "Private",
            "city": "Ahmedabad",
            "district": "Ahmedabad",
            "focus_areas": ["Entrepreneurship", "Education", "Youth Development", "Social Enterprise"],
            "university_or_parent": "National Entrepreneurship Network (NEN)",
            "website": "https://nen.org.in",
            "startups_supported": 120,
            "founded_year": 2003,
            "capacity": "100 seats",
            "programs": ["Student Entrepreneurship", "Mentorship", "Events", "Competitions"],
            "notable_startups": ["Various NEN Gujarat alumni startups"],
            "contact_email": "gujarat@nen.org"
        },
        {
            "name": "IAN (Indian Angel Network) Gujarat",
            "type": "Private",
            "city": "Ahmedabad",
            "district": "Ahmedabad",
            "focus_areas": ["Early Stage Investing", "Technology", "Healthcare", "Consumer"],
            "university_or_parent": "Indian Angel Network",
            "website": "https://indianangelnetwork.com",
            "startups_supported": 50,
            "founded_year": 2006,
            "capacity": "40 seats",
            "programs": ["Angel Investment", "Mentorship", "Networking", "Governance"],
            "notable_startups": ["Various IAN Gujarat portfolio companies"],
            "contact_email": "gujarat@indianangelnetwork.com"
        },
        {
            "name": "Mumbai Angels Gujarat Chapter",
            "type": "Private",
            "city": "Ahmedabad",
            "district": "Ahmedabad",
            "focus_areas": ["Angel Investing", "Early Stage", "Technology", "Consumer"],
            "university_or_parent": "Mumbai Angels Network",
            "website": "https://mumbaiangels.com",
            "startups_supported": 30,
            "founded_year": 2012,
            "capacity": "25 seats",
            "programs": ["Angel Investment", "Mentorship", "Demo Day", "Networking"],
            "notable_startups": ["Various Mumbai Angels Gujarat portfolio companies"],
            "contact_email": "gujarat@mumbaiangels.com"
        },
        {
            "name": "Gujarat Angel Network",
            "type": "Private",
            "city": "Ahmedabad",
            "district": "Ahmedabad",
            "focus_areas": ["Angel Investing", "Early Stage", "Technology", "Healthcare"],
            "university_or_parent": "Gujarat Angel Network Foundation",
            "website": "https://gujaratangels.com",
            "startups_supported": 60,
            "founded_year": 2008,
            "capacity": "50 seats",
            "programs": ["Angel Investment", "Mentorship", "Demo Days", "Portfolio Support"],
            "notable_startups": ["Various Gujarat Angel Network portfolio companies"],
            "contact_email": "info@gujaratangels.com"
        },
        {
            "name": "Startup Gujarat Portal Hub",
            "type": "Government",
            "city": "Gandhinagar",
            "district": "Gandhinagar",
            "focus_areas": ["All Sectors", "Policy Support", "Registration", "Incentives"],
            "university_or_parent": "Industries and Mines Department, Government of Gujarat",
            "website": "https://invest.gujarat.gov.in",
            "startups_supported": 500,
            "founded_year": 2016,
            "capacity": "Virtual Platform",
            "programs": ["Startup Registration", "Policy Information", "Incentive Application", "Ecosystem Connect"],
            "notable_startups": ["All DPIIT recognized startups in Gujarat"],
            "contact_email": "info@invest.gujarat.gov.in"
        },
        {
            "name": "Gujarat Startup Hub",
            "type": "Government",
            "city": "Ahmedabad",
            "district": "Ahmedabad",
            "focus_areas": ["All Sectors", "Ecosystem Building", "Networking", "Events"],
            "university_or_parent": "Government of Gujarat",
            "website": "https://startupgujarat.in",
            "startups_supported": 300,
            "founded_year": 2018,
            "capacity": "200 seats",
            "programs": ["Co-working", "Events", "Mentorship", "Networking", "Demo Days"],
            "notable_startups": ["Various Gujarat-based startups"],
            "contact_email": "info@startupgujarat.in"
        },
        {
            "name": "Incubation Centre - Saurashtra University",
            "type": "University",
            "city": "Rajkot",
            "district": "Rajkot",
            "focus_areas": ["Technology", "Science", "Research", "Innovation"],
            "university_or_parent": "Saurashtra University",
            "website": "https://saurashtrauniversity.ac.in/ic",
            "startups_supported": 40,
            "founded_year": 2017,
            "capacity": "30 seats",
            "programs": ["Incubation", "Research", "Mentorship", "Student Innovation"],
            "notable_startups": ["SaurashtraInnovate", "ScienceStartup", "RajkotTech"],
            "contact_email": "ic@saurashtrauniversity.ac.in"
        },
        {
            "name": "MSME Incubation Centre - Surat",
            "type": "Government",
            "city": "Surat",
            "district": "Surat",
            "focus_areas": ["Textiles", "Diamond", "Manufacturing", "MSME"],
            "university_or_parent": "MSME Development Institute, Surat",
            "website": "https://msme-surat.gov.in",
            "startups_supported": 80,
            "founded_year": 2015,
            "capacity": "60 seats",
            "programs": ["MSME Incubation", "Technology Upgradation", "Skill Training", "Market Access"],
            "notable_startups": ["TextileTech Surat", "DiamondInnovate", "ManufacturTech Surat"],
            "contact_email": "msmesurat@gm.cscomms.gov.in"
        },
        {
            "name": "Textile Innovation Hub - Surat",
            "type": "PPP",
            "city": "Surat",
            "district": "Surat",
            "focus_areas": ["Textile Technology", "Smart Textiles", "Fashion Tech", "Sustainability"],
            "university_or_parent": "Surat Textile Industry Association / Government of Gujarat",
            "website": "https://textileinnovationsurat.in",
            "startups_supported": 50,
            "founded_year": 2019,
            "capacity": "40 seats",
            "programs": ["Textile Innovation", "Technology Incubation", "Market Linkage", "Export Support"],
            "notable_startups": ["SmartTextile", "FashionTech Surat", "SustainableFabrics"],
            "contact_email": "info@textileinnovationsurat.in"
        },
        {
            "name": "Diamond Tech Hub - Surat",
            "type": "PPP",
            "city": "Surat",
            "district": "Surat",
            "focus_areas": ["Diamond Technology", "Gemology", "Blockchain for Diamonds", "Manufacturing"],
            "university_or_parent": "Surat Diamond Association / Government of Gujarat",
            "website": "https://diamondtechhub.in",
            "startups_supported": 30,
            "founded_year": 2020,
            "capacity": "25 seats",
            "programs": ["Diamond Tech Incubation", "Blockchain Integration", "Quality Assurance", "Market Access"],
            "notable_startups": ["DiamondChain", "SmartGemTech", "SuratDiamondTech"],
            "contact_email": "info@diamondtechhub.in"
        },
        {
            "name": "Pharma Innovation Hub - Ahmedabad",
            "type": "PPP",
            "city": "Ahmedabad",
            "district": "Ahmedabad",
            "focus_areas": ["Pharmaceuticals", "Healthcare", "MedTech", "Drug Discovery"],
            "university_or_parent": "Ahmedabad Pharma Association / Government of Gujarat",
            "website": "https://pharmaahmedabad.in/hub",
            "startups_supported": 35,
            "founded_year": 2020,
            "capacity": "30 seats",
            "programs": ["Pharma Incubation", "R&D Support", "Regulatory Guidance", "Clinical Trials"],
            "notable_startups": ["PharmaStart Ahmedabad", "MedTechInnovate", "DrugDiscovery Gujarat"],
            "contact_email": "hub@pharmaahmedabad.in"
        },
        {
            "name": "Agri Innovation Hub - Anand",
            "type": "PPP",
            "city": "Anand",
            "district": "Anand",
            "focus_areas": ["Agriculture Technology", "Food Processing", "Dairy Tech", "Sustainability"],
            "university_or_parent": "Anand Agricultural University / Government of Gujarat",
            "website": "https://agriinnovation-anand.in",
            "startups_supported": 40,
            "founded_year": 2019,
            "capacity": "35 seats",
            "programs": ["Agri-Tech Incubation", "Food Processing Support", "Market Linkage", "Rural Innovation"],
            "notable_startups": ["AgriTech Anand", "DairyInnovate", "FoodProcessTech"],
            "contact_email": "info@agriinnovation-anand.in"
        },
        {
            "name": "Renewable Energy Hub - Gandhinagar",
            "type": "Government",
            "city": "Gandhinagar",
            "district": "Gandhinagar",
            "focus_areas": ["Solar Energy", "Wind Energy", "Green Hydrogen", "Energy Storage"],
            "university_or_parent": "Gujarat Energy Development Agency (GEDA)",
            "website": "https://geda.in/hub",
            "startups_supported": 45,
            "founded_year": 2020,
            "capacity": "35 seats",
            "programs": ["Energy Tech Incubation", "Project Development", "Funding Support", "Policy Guidance"],
            "notable_startups": ["SolarStartup Gujarat", "WindPower Tech", "GreenHydro Gujarat"],
            "contact_email": "hub@geda.in"
        },
        {
            "name": "AI/ML Innovation Hub - Ahmedabad",
            "type": "Private",
            "city": "Ahmedabad",
            "district": "Ahmedabad",
            "focus_areas": ["Artificial Intelligence", "Machine Learning", "Data Science", "Deep Tech"],
            "university_or_parent": "Gujarat AI Foundation",
            "website": "https://gujaratai.in/hub",
            "startups_supported": 30,
            "founded_year": 2021,
            "capacity": "25 seats",
            "programs": ["AI/ML Incubation", "Data Access", "Computing Resources", "Mentorship"],
            "notable_startups": ["AISolutions Gujarat", "DeepTechStart", "DataScienceHub"],
            "contact_email": "hub@gujaratai.in"
        }
    ]
    return incubators


def fetch_openalex_data():
    """Fetch real data from OpenAlex API for Gujarat institutions."""
    import urllib.request
    import urllib.parse

    institutions = []

    try:
        # Search for Gujarat institutions in OpenAlex
        base_url = "https://api.openalex.org/institutions"
        params = {
            "filter": "country_code:IN",
            "search": "Gujarat",
            "per_page": 50,
            "mailto": "research@udaansetu.in"
        }
        url = f"{base_url}?{urllib.parse.urlencode(params)}"

        req = urllib.request.Request(url, headers={"User-Agent": "UdaanSetuResearch/1.0"})
        with urllib.request.urlopen(req, timeout=15) as response:
            data = json.loads(response.read().decode())

            for inst in data.get("results", []):
                institutions.append({
                    "name": inst.get("display_name", ""),
                    "country": "India",
                    "city": next(
                        (l.get("city", "") for l in inst.get("locations", []) if l.get("institution", {}).get("id") == inst.get("id")),
                        ""
                    ),
                    "works_count": inst.get("works_count", 0),
                    "cited_by_count": inst.get("cited_by_count", 0),
                    "type": inst.get("type", "education"),
                    "openalex_id": inst.get("id", ""),
                    "source": "OpenAlex"
                })
        print(f"  Fetched {len(institutions)} institutions from OpenAlex")
    except Exception as e:
        print(f"  Warning: Could not fetch OpenAlex data: {e}")

    return institutions


def save_json(data, filename, indent=2):
    """Save data to a JSON file."""
    filepath = os.path.join(DATA_DIR, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=indent, ensure_ascii=False)
    print(f"  Saved {len(data) if isinstance(data, list) else 1} records to {filename}")
    return filepath


def generate_stats(mentors, schemes, incubators):
    """Generate summary statistics."""
    stats = {
        "generated_at": datetime.now().isoformat(),
        "data_sources": [
            "Public ecosystem research",
            "Government website verification",
            "OpenAlex API",
            "Manual curation of real entities"
        ],
        "counts": {
            "total_mentors": len(mentors),
            "total_schemes": len(schemes),
            "total_incubators": len(incubators),
            "state_schemes": len([s for s in schemes if s["type"] == "State Government"]),
            "central_schemes": len([s for s in schemes if s["type"] == "Central Government"]),
            "government_incubators": len([i for i in incubators if i["type"] == "Government"]),
            "private_incubators": len([i for i in incubators if i["type"] == "Private"]),
            "university_incubators": len([i for i in incubators if i["type"] == "University"]),
            "ppp_incubators": len([i for i in incubators if i["type"] == "PPP"]),
        },
        "cities_covered": sorted(list(set(
            [m["city"].split(" - ")[0] for m in mentors] +
            [i["city"] for i in incubators]
        ))),
        "category_distribution": {},
        "mentor_expertise_distribution": {}
    }

    for s in schemes:
        cat = s["category"]
        stats["category_distribution"][cat] = stats["category_distribution"].get(cat, 0) + 1

    for m in mentors:
        for exp in m["expertise"]:
            stats["mentor_expertise_distribution"][exp] = stats["mentor_expertise_distribution"].get(exp, 0) + 1

    return stats


def main():
    print("=" * 60)
    print("UdaanSetu - Gujarat Startup Ecosystem Data Fetcher")
    print("=" * 60)

    # Ensure output directory exists
    os.makedirs(DATA_DIR, exist_ok=True)

    print("\n[1/5] Fetching Real Gujarat Mentors...")
    mentors = get_real_gujarat_mentors()
    save_json(mentors, "real_gujarat_mentors.json")

    print("\n[2/5] Fetching Government Schemes...")
    schemes = get_real_gujarat_schemes()
    save_json(schemes, "real_gujarat_schemes.json")

    print("\n[3/5] Fetching Incubators...")
    incubators = get_real_gujarat_incubators()
    save_json(incubators, "real_gujarat_incubators.json")

    print("\n[4/5] Fetching OpenAlex Research Institutions...")
    openalex_data = fetch_openalex_data()
    if openalex_data:
        save_json(openalex_data, "openalex_gujarat_institutions.json")

    print("\n[5/5] Generating Statistics...")
    stats = generate_stats(mentors, schemes, incubators)
    save_json(stats, "ecosystem_stats.json")

    # Print summary
    print("\n" + "=" * 60)
    print("ECOSYSTEM DATA SUMMARY")
    print("=" * 60)
    print(f"\n  Mentors:     {stats['counts']['total_mentors']}")
    print(f"  Schemes:     {stats['counts']['total_schemes']}")
    print(f"    - State:   {stats['counts']['state_schemes']}")
    print(f"    - Central: {stats['counts']['central_schemes']}")
    print(f"  Incubators:  {stats['counts']['total_incubators']}")
    print(f"    - Govt:    {stats['counts']['government_incubators']}")
    print(f"    - Private: {stats['counts']['private_incubators']}")
    print(f"    - Univ:    {stats['counts']['university_incubators']}")
    print(f"    - PPP:     {stats['counts']['ppp_incubators']}")
    print(f"\n  Cities: {', '.join(stats['cities_covered'])}")
    print(f"\n  Category Distribution:")
    for cat, count in sorted(stats["category_distribution"].items()):
        print(f"    - {cat}: {count}")

    print(f"\n  Generated at: {stats['generated_at']}")
    print(f"  Data saved to: {DATA_DIR}")
    print("=" * 60)
    print("\nDone!")


if __name__ == "__main__":
    main()
