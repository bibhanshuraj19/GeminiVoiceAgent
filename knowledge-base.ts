
export const DEGREE_KNOWLEDGE_BASE = {
  "undergraduate_degrees": {
    "arts": {
      "stream_name": "Arts and Humanities",
      "common_degree": "Bachelor of Arts (BA)",
      "duration": "3 years",
      "specializations": [
        "English Literature", "Hindi Literature", "Sanskrit", "History", "Political Science", 
        "Economics", "Psychology", "Sociology", "Philosophy", "Geography", 
        "Journalism and Mass Communication", "Fine Arts", "Music", "Anthropology", 
        "Public Administration", "Social Work", "Library Science", "Linguistics", 
        "Foreign Languages (French, German, Spanish, etc.)"
      ],
      "other_degrees": [
        { "name": "Bachelor of Fine Arts (BFA)", "duration": "3-4 years", "specializations": ["Painting", "Sculpture", "Applied Arts", "Graphic Design"] },
        { "name": "Bachelor of Social Work (BSW)", "duration": "3 years" },
        { "name": "Bachelor of Journalism (BJ)", "duration": "3 years" },
        { "name": "Bachelor of Design (B.Des)", "duration": "4 years", "specializations": ["Fashion Design", "Interior Design", "Product Design", "Communication Design"] }
      ]
    },
    "commerce": {
      "stream_name": "Commerce and Business",
      "common_degree": "Bachelor of Commerce (B.Com)",
      "duration": "3 years",
      "specializations": [
        "Accounting and Finance", "Banking and Insurance", "Taxation", "Business Management", 
        "E-Commerce", "Marketing", "Corporate Secretaryship", "Cost Accounting"
      ],
      "other_degrees": [
        { "name": "Bachelor of Business Administration (BBA)", "duration": "3 years", "specializations": ["Finance", "Marketing", "Human Resources", "International Business", "Operations"] },
        { "name": "Bachelor of Management Studies (BMS)", "duration": "3 years" },
        { "name": "Bachelor of Business Management (BBM)", "duration": "3 years" },
        { "name": "Chartered Accountancy (CA)", "duration": "4-5 years", "type": "Professional Course" },
        { "name": "Company Secretary (CS)", "duration": "3-4 years", "type": "Professional Course" },
        { "name": "Cost and Management Accountant (CMA)", "duration": "3-4 years", "type": "Professional Course" }
      ]
    },
    "science": {
      "stream_name": "Science",
      "common_degree": "Bachelor of Science (B.Sc)",
      "duration": "3 years",
      "branches": {
        "computer_science": {
          "branch_name": "Computer Science and IT",
          "specializations": ["Computer Science", "Information Technology", "Computer Applications", "Data Science", "Artificial Intelligence", "Machine Learning", "Cyber Security", "Cloud Computing", "Software Engineering"],
          "professional_degrees": [{ "name": "Bachelor of Computer Applications (BCA)", "duration": "3 years" }]
        },
        "physics": { "branch_name": "Physics", "specializations": ["Physics (General)", "Applied Physics", "Electronics", "Nuclear Physics", "Astrophysics", "Medical Physics"] },
        "chemistry": { "branch_name": "Chemistry", "specializations": ["Chemistry (General)", "Analytical Chemistry", "Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry", "Industrial Chemistry", "Pharmaceutical Chemistry"] },
        "mathematics": { "branch_name": "Mathematics", "specializations": ["Mathematics (General)", "Applied Mathematics", "Statistics", "Actuarial Science", "Operations Research"] },
        "biology": { "branch_name": "Biological Sciences", "specializations": ["Botany", "Zoology", "Microbiology", "Biotechnology", "Biochemistry", "Molecular Biology", "Genetics", "Bioinformatics", "Life Sciences"] },
        "environmental_science": { "branch_name": "Environmental Sciences", "specializations": ["Environmental Science", "Ecology", "Marine Biology", "Forestry", "Wildlife Science", "Climate Science"] },
        "agriculture": {
          "branch_name": "Agricultural Sciences",
          "specializations": ["Agriculture", "Horticulture", "Agricultural Economics", "Soil Science", "Plant Pathology", "Entomology"],
          "professional_degrees": [{ "name": "Bachelor of Science in Agriculture (B.Sc Ag)", "duration": "4 years" }]
        },
        "food_technology": { "branch_name": "Food Technology", "specializations": ["Food Technology", "Food Science", "Nutrition and Dietetics"] }
      }
    },
    "engineering": {
      "stream_name": "Engineering and Technology",
      "common_degree": "Bachelor of Technology (B.Tech) / Bachelor of Engineering (B.E.)",
      "duration": "4 years",
      "branches": [
        { "name": "Computer Science Engineering", "sub_specializations": ["AI & ML", "Data Science", "Cyber Security", "Cloud Computing"] },
        { "name": "Information Technology" },
        { "name": "Electronics and Communication Engineering" },
        { "name": "Electrical Engineering", "sub_specializations": ["Power Systems", "Control Systems", "Renewable Energy"] },
        { "name": "Mechanical Engineering", "sub_specializations": ["Automotive", "Robotics", "Thermal Engineering"] },
        { "name": "Civil Engineering", "sub_specializations": ["Structural", "Transportation", "Environmental", "Construction Management"] },
        { "name": "Aerospace Engineering" },
        { "name": "Biotechnology Engineering" },
        { "name": "Mechatronics Engineering" }
      ]
    },
    "medical": {
      "stream_name": "Medical and Health Sciences",
      "degrees": [
        { "name": "Bachelor of Medicine, Bachelor of Surgery (MBBS)", "duration": "5.5 years (including 1 year internship)", "eligibility": "NEET qualified" },
        { "name": "Bachelor of Dental Surgery (BDS)", "duration": "5 years", "eligibility": "NEET qualified" },
        { "name": "Bachelor of Ayurvedic Medicine and Surgery (BAMS)", "duration": "5.5 years", "eligibility": "NEET qualified" },
        { "name": "Bachelor of Pharmacy (B.Pharm)", "duration": "4 years" },
        { "name": "Bachelor of Physiotherapy (BPT)", "duration": "4.5 years" },
        { "name": "Bachelor of Science in Nursing (B.Sc Nursing)", "duration": "4 years" }
      ]
    },
    "law": {
      "stream_name": "Law",
      "degrees": [
        { "name": "Bachelor of Laws (LLB)", "duration": "3 years", "eligibility": "After graduation" },
        { "name": "Integrated BA LLB", "duration": "5 years", "eligibility": "After 12th" }
      ]
    }
  },
  "postgraduate_degrees": {
    "commerce": {
      "stream_name": "Commerce and Business",
      "common_degree": "Master of Commerce (M.Com)",
      "duration": "2 years",
      "other_degrees": [
        {
          "name": "Master of Business Administration (MBA)",
          "duration": "2 years",
          "specializations": ["Finance", "Marketing", "HR", "Operations", "Business Analytics", "Digital Marketing", "Entrepreneurship"]
        }
      ]
    },
    "science": {
      "stream_name": "Science",
      "common_degree": "Master of Science (M.Sc)",
      "duration": "2 years",
      "branches": {
        "computer_science": {
          "branch_name": "Computer Science and IT",
          "specializations": ["Data Science", "AI", "Machine Learning", "Cyber Security", "Cloud Computing"],
          "professional_degrees": [{ "name": "Master of Computer Applications (MCA)", "duration": "2 years" }]
        }
      }
    }
  }
};
