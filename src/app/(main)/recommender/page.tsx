"use client";
import { useState, useEffect } from "react";
import Script from "next/script";
import { loadPdfJs } from "@/lib/utils";
import constants, { buildPresenceChecklist } from "@/lib/constant";

declare global {
  interface Window {
    puter?: {
      ai?: {
        chat?: any;
      };
    };
  }
}

type PDFJSLib = typeof import("pdfjs-dist");

interface Job {
  title: string;
  company: string;
  location: string;
  description: string;
  apply_link: string;
  score?: number; // Cosine similarity score (0 to 1)
  matchPercentage?: number; // Human-readable percentage (0 to 100)
  isRemote?: boolean; // Flag for remote jobs
}

interface RoleRecommendation {
  primaryRole: string;
  level: string;
  alternativeRoles: string[];
  summary: string;
  experienceYears?: string;
  keySkills?: string[];
}

export default function JobRecommenderPage() {
  const [aiReady, setAiReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [pdfjsLib, setPdfjsLib] = useState<PDFJSLib | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [hasStoredResume, setHasStoredResume] = useState<boolean>(false);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [roleRecommendations, setRoleRecommendations] = useState<RoleRecommendation | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.puter?.ai?.chat) {
        setAiReady(true);
        clearInterval(interval);
      }
    }, 300);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    (async () => {
      const lib = await loadPdfJs();
      if (lib) setPdfjsLib(lib);
      console.log("✅ PDF.js Loaded:", lib?.version);
    })();
  }, []);

  // ----------------------
  // Check for resume text from resumes page
  // ----------------------
  useEffect(() => {
    const storedText = sessionStorage.getItem("resumeText");
    const storedFileName = sessionStorage.getItem("resumeFileName");
    if (storedText) {
      setHasStoredResume(true);
      if (storedFileName) {
        setResumeFileName(storedFileName);
      }
      if (aiReady && !isLoading && jobs.length === 0) {
        // Auto-process the resume text
        setResumeText(storedText);
        setIsLoading(true);
        setErrorMessage(null);

        // Trigger job recommendation asynchronously
        (async () => {
          try {
            if (!window.puter?.ai?.chat) {
              throw new Error(
                "AI service is not ready. Please wait a moment and try again.",
              );
            }

            if (!storedText || storedText.trim().length < 50) {
              throw new Error(
                "Resume text is too short or empty. Please ensure your resume has sufficient content.",
              );
            }

            // Validate if it's a proper resume
            await validateResume(storedText);

            // Step 1: Generate role recommendations (parallel with keyword extraction)
            const [roleRecs, keywords] = await Promise.all([
              suggestJobRoles(storedText),
              extractKeywords(storedText),
            ]);

            console.log("Extracted keywords:", keywords);
            setRoleRecommendations(roleRecs);

            if (!keywords || keywords.length === 0) {
              throw new Error(
                "Failed to extract keywords from resume. Please try again.",
              );
            }

            // Step 2: Fetch and rank jobs
            const fetchedJobs = await fetchJobs(keywords);
            const rankedJobs = rankJobs(storedText, fetchedJobs);
            setJobs(rankedJobs);
            setErrorMessage(null);

            // If no jobs found, show info message but keep role recommendations
            if (rankedJobs.length === 0) {
              setInfoMessage(
                "No jobs found in Nepal or remote positions matching your profile at this time. This may be due to limited listings in the international job database.\n\n" +
                "We recommend checking these local job portals:\n" +
                "• Merojob.com - Nepal's largest job portal\n" +
                "• Kumarijob.com - Popular job site in Nepal\n" +
                "• JobsNepal.com - Local job listings\n" +
                "• Ramrojob.com - IT and tech jobs in Nepal\n" +
                "• LinkedIn Jobs - Filter by Nepal or Remote\n" +
                "• Remote.co - International remote opportunities"
              );
            } else {
              setInfoMessage(null);
            }

            // Clean up sessionStorage
            sessionStorage.removeItem("resumeText");
            sessionStorage.removeItem("resumeFileName");
            setHasStoredResume(false);
          } catch (err: any) {
            console.error("Job recommendation error:", err);
            const errorMessage =
              err instanceof Error
                ? err.message
                : "An unexpected error occurred during job recommendation. Please try again.";
            setErrorMessage(errorMessage);
            sessionStorage.removeItem("resumeText");
            sessionStorage.removeItem("resumeFileName");
            setHasStoredResume(false);
          } finally {
            setIsLoading(false);
          }
        })();
      }
    }
  }, [aiReady, isLoading, jobs.length]);

  const reset = () => {
    setUploadedFile(null);
    setResumeText("");
    setJobs([]);
    setRoleRecommendations(null);
    setIsLoading(false);
    setHasStoredResume(false);
    setResumeFileName(null);
    setErrorMessage(null);
    setInfoMessage(null);
    sessionStorage.removeItem("resumeText");
    sessionStorage.removeItem("resumeFileName");
  };

  // =====================================================================
  // CAREER ROLE RECOMMENDATION AI
  // =====================================================================
  /**
   * Analyzes resume and suggests suitable job roles using AI
   * Returns primary role + 3-4 alternative roles based on:
   * - Skills and technologies
   * - Years of experience
   * - Education background
   * - Project complexity
   */
  const suggestJobRoles = async (text: string): Promise<RoleRecommendation> => {
    try {
      if (!window.puter?.ai?.chat) {
        throw new Error("AI service is not ready. Please wait and try again.");
      }

      if (!text || text.trim().length < 50) {
        throw new Error("Resume text is too short for role analysis.");
      }

      console.log("🎯 Analyzing resume for career role recommendations...");

      const prompt = `Analyze this resume and suggest suitable job roles based on the candidate's profile.

ANALYSIS CRITERIA:
1. **Experience Level:**
   - Junior: 0-2 years experience
   - Mid-Level: 2-5 years experience
   - Senior: 5-10 years experience
   - Lead/Principal: 10+ years experience

2. **Technical Skills:** Identify key technologies, frameworks, languages, and tools

3. **Domain Expertise:** Determine industry focus (Web Dev, Mobile, DevOps, Data, etc.)

4. **Role Suitability:** Match skills and experience to specific job titles

RESUME TEXT:
"""${text.substring(0, 8000)}"""

RESPOND WITH JSON ONLY (no markdown, no explanations):
{
  "primaryRole": "Most suitable job title",
  "level": "Junior/Mid-Level/Senior/Lead",
  "alternativeRoles": ["Alternative role 1", "Alternative role 2", "Alternative role 3", "Alternative role 4"],
  "summary": "Professional 2-3 sentence summary of why they fit this role",
  "experienceYears": "X+ years",
  "keySkills": ["Skill1", "Skill2", "Skill3", "Skill4", "Skill5"]
}

IMPORTANT:
- Be specific with job titles (e.g., "Full-Stack Developer (MERN)" not just "Developer")
- Include technology stack in role names where relevant
- Ensure alternative roles are distinct and realistic
- Summary should be professional and encouraging
- Alternative roles should be ordered by best fit`;

      const response = await window.puter.ai.chat(
        [
          {
            role: "system",
            content:
              "You are an expert career advisor and technical recruiter with deep knowledge of software engineering roles, career progression, and skill-to-job matching. Provide accurate, professional, and helpful career guidance.",
          },
          { role: "user", content: prompt },
        ],
        {
          model: "gpt-4o",
          temperature: 0.4, // Balanced for consistent yet creative suggestions
        }
      );

      if (!response) {
        throw new Error("No response from AI service.");
      }

      const responseContent =
        typeof response === "string"
          ? response
          : response.message?.content || "";

      if (!responseContent || responseContent.trim().length === 0) {
        throw new Error("Empty response from AI service.");
      }

      console.log("📋 AI Response:", responseContent);

      // Extract JSON from response
      const jsonMatch = responseContent.match(/{[\s\S]*}/);
      if (!jsonMatch) {
        throw new Error("Invalid AI response format. Please try again.");
      }

      const recommendations: RoleRecommendation = JSON.parse(jsonMatch[0]);

      // Validate required fields
      if (
        !recommendations.primaryRole ||
        !recommendations.level ||
        !recommendations.alternativeRoles ||
        !recommendations.summary
      ) {
        throw new Error("Incomplete role recommendations. Please try again.");
      }

      console.log("✅ Role recommendations generated:", recommendations);
      return recommendations;
    } catch (err: any) {
      console.error("Role suggestion error:", err);
      throw new Error(
        err.message || "Failed to generate role recommendations."
      );
    }
  };

  const extractPDFText = async (file: File): Promise<string> => {
    if (!pdfjsLib) throw new Error("PDF.js not loaded yet");
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const texts = await Promise.all(
      Array.from({ length: pdf.numPages }, async (_, i) => {
        const page = await pdf.getPage(i + 1);
        const content = await page.getTextContent();
        return content.items.map((item: any) => item.str).join(" ");
      }),
    );
    return texts.join("\n").trim();
  };

  // ----------------------
  // Validate if PDF is a proper resume
  // ----------------------
  const validateResume = async (text: string): Promise<void> => {
    if (!window.puter?.ai?.chat) {
      throw new Error(
        "AI service is not ready. Please wait a moment and try again.",
      );
    }

    if (!text || text.trim().length < 50) {
      throw new Error(
        "Resume text is too short or empty. Please ensure your resume has sufficient content.",
      );
    }

    // Quick validation check for resume-like content
    const resumeKeywords = [
      "experience",
      "education",
      "skills",
      "summary",
      "work",
      "employment",
      "position",
      "company",
      "degree",
      "university",
      "college",
      "email",
      "phone",
      "contact",
    ];

    const lowerText = text.toLowerCase();
    const foundKeywords = resumeKeywords.filter((keyword) =>
      lowerText.includes(keyword),
    );

    if (foundKeywords.length < 3) {
      throw new Error(
        "This document does not appear to be a resume. Please upload a proper resume containing professional experience, education, and skills sections.",
      );
    }

    // Use AI to validate more thoroughly
    const validationPrompt = `Analyze this document and determine if it is a resume/CV. Look for:
- Professional experience, work history, or employment information
- Education background, degrees, or academic information
- Skills, qualifications, or professional competencies
- Contact information and personal details

Respond with ONLY a JSON object in this format:
{
  "isResume": true or false,
  "reason": "brief explanation"
}

Document text:
"""${text.substring(0, 2000)}"""`;

    try {
      const response = await window.puter.ai.chat(
        [{ role: "user", content: validationPrompt }],
        { model: "gpt-4o-mini" },
      );

      const responseContent =
        typeof response === "string"
          ? response
          : response.message?.content || "";

      const jsonMatch = responseContent.match(/{[\s\S]*}/);
      if (jsonMatch) {
        const validation = JSON.parse(jsonMatch[0]);
        if (!validation.isResume) {
          throw new Error(
            validation.reason ||
              "This document does not appear to be a resume. Please upload a proper resume containing professional experience, education, and skills sections.",
          );
        }
      }
    } catch (err: any) {
      // If it's an error about not being a resume, throw it
      if (err.message && err.message.includes("not appear to be a resume")) {
        throw err;
      }
      // For other validation errors, log warning but allow to proceed
      // The full extraction will catch non-resume documents anyway
      console.warn("Resume validation warning:", err);
    }
  };

  // ----------------------
  // Extract keywords from resume
  // ----------------------
  const extractKeywords = async (text: string): Promise<string[]> => {
    try {
      if (!window.puter?.ai?.chat) {
        throw new Error(
          "AI service is not ready. Please wait a moment and try again.",
        );
      }

      if (!text || text.trim().length < 50) {
        throw new Error(
          "Resume text is too short. Please upload a complete resume with sufficient content.",
        );
      }

      const prompt = constants.JOB_RECOMMENDER_PROMPT.replace(
        "{{DOCUMENT_TEXT}}",
        text.substring(0, 10000), // Limit text length to prevent token limits
      );

      const response = await window.puter.ai.chat(
        [
          {
            role: "system",
            content:
              "You are an expert career advisor and job matching specialist with extensive experience in resume analysis and job recommendations. Extract relevant keywords accurately and efficiently.",
          },
          { role: "user", content: prompt },
        ],
        {
          model: "gpt-4o",
          temperature: 0.3, // Lower temperature for more consistent results
        },
      );

      if (!response) {
        throw new Error(
          "No response received from AI service. Please try again.",
        );
      }

      const responseContent =
        typeof response === "string"
          ? response
          : response.message?.content || "";

      if (!responseContent || responseContent.trim().length === 0) {
        throw new Error("Empty response from AI service. Please try again.");
      }

      // Check for error in response
      const errorMatch = responseContent.match(/{"error"\s*:\s*"([^"]+)"/);
      if (errorMatch) {
        throw new Error(errorMatch[1]);
      }

      // Try to find JSON array in the response
      const jsonMatch = responseContent.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error(
          "No valid keyword array found in AI response. Please try again.",
        );
      }

      const keywords = JSON.parse(jsonMatch[0]);

      if (!Array.isArray(keywords) || keywords.length === 0) {
        throw new Error("Invalid keyword extraction result. Please try again.");
      }

      return keywords;
    } catch (err: any) {
      console.error("Keyword extraction error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during keyword extraction. Please try again.";
      throw new Error(errorMessage);
    }
  };

  const fetchJobs = async (keywords: string[]): Promise<Job[]> => {
    try {
      if (!keywords || keywords.length === 0) {
        throw new Error("No keywords provided for job search.");
      }

      const query = keywords.slice(0, 3).join(" ");
      if (!query || query.trim().length === 0) {
        throw new Error("Invalid search query generated from keywords.");
      }

      const apiKey = process.env.NEXT_PUBLIC_RAPIDAPI_KEY;
      if (!apiKey) {
        throw new Error(
          "Job search API key is not configured. Please contact support.",
        );
      }

      // =====================================================================
      // NEPAL-SPECIFIC JOB SEARCH
      // =====================================================================
      // Location filtering for Kathmandu, Nepal and surrounding areas
      const location = "Kathmandu, Nepal";
      const countryCode = "NP"; // Nepal country code

      console.log(`🔍 Searching for "${query}" jobs in ${location}...`);

      // Fetch more pages since Nepal jobs might be limited
      const res = await fetch(
        `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}&country=${countryCode}&num_pages=2`,
        {
          headers: {
            "x-rapidapi-key": apiKey,
            "x-rapidapi-host": "jsearch.p.rapidapi.com",
          },
        },
      );

      if (!res.ok) {
        throw new Error(
          `Failed to fetch jobs: ${res.status} ${res.statusText}. Please try again.`,
        );
      }

      const data = await res.json();

      if (!data || !data.data || !Array.isArray(data.data)) {
        throw new Error(
          "Invalid response from job search API. Please try again.",
        );
      }

      console.log(`📦 API returned ${data.data.length} total jobs`);

      // =====================================================================
      // POST-FILTERING FOR NEPAL LOCATIONS + REMOTE JOBS
      // =====================================================================
      // Filter to include:
      // 1. Jobs in Nepal cities
      // 2. Remote jobs (can be done from anywhere, including Nepal)
      const nepalKeywords = [
        "nepal",
        "kathmandu",
        "pokhara",
        "lalitpur",
        "bhaktapur",
        "biratnagar",
        "birgunj",
        "bharatpur",
        "janakpur",
        "dharan",
      ];

      const remoteKeywords = [
        "remote",
        "work from home",
        "wfh",
        "anywhere",
        "work from anywhere",
        "telecommute",
        "virtual",
      ];

      const filteredJobs = data.data.filter((job: any) => {
        const jobLocation = (
          (job.job_city || "") +
          " " +
          (job.job_state || "") +
          " " +
          (job.job_country || "")
        ).toLowerCase();

        // Check if job is in Nepal
        const isNepalJob = nepalKeywords.some((keyword) =>
          jobLocation.includes(keyword)
        );

        // Check if job is remote (can be done from anywhere)
        const isRemoteJob =
          job.job_is_remote === true || // API remote flag
          remoteKeywords.some((keyword) => jobLocation.includes(keyword));

        // Accept job if it's either in Nepal OR remote
        const shouldInclude = isNepalJob || isRemoteJob;

        if (shouldInclude) {
          const jobType = isRemoteJob ? "🌐 Remote" : "🇳🇵 Nepal";
          console.log(
            `✓ Accepted [${jobType}]: ${job.job_title} at ${job.employer_name} (${jobLocation || "remote"})`
          );
        }

        return shouldInclude;
      });

      console.log(
        `📍 Filtered to ${filteredJobs.length} jobs (Nepal locations + Remote)`
      );

      // Map to Job interface with remote flag
      const jobs = filteredJobs.map((job: any) => {
        const jobLocation = (
          (job.job_city || "") +
          " " +
          (job.job_state || "") +
          " " +
          (job.job_country || "")
        ).toLowerCase();

        // Determine if job is remote
        const isRemoteJob =
          job.job_is_remote === true ||
          remoteKeywords.some((keyword) => jobLocation.includes(keyword));

        return {
          title: job.job_title || "Job Title Not Available",
          company: job.employer_name || "Company Not Available",
          location: isRemoteJob
            ? "Remote"
            : job.job_city || job.job_state || job.job_country || "Kathmandu, Nepal",
          description: job.job_description || "No description available",
          apply_link: job.job_apply_link || "#",
          isRemote: isRemoteJob,
        };
      });

      // =====================================================================
      // HANDLE NO RESULTS - Return empty array with info message
      // =====================================================================
      if (jobs.length === 0) {
        console.log("⚠️ No jobs found in Nepal or remote positions");
        // Don't throw error - just return empty array
        // The UI will show role recommendations + info message
        return [];
      }

      console.log(`✅ Returning ${jobs.length} jobs (Nepal + Remote)`);
      return jobs;
    } catch (err: any) {
      console.error("Job fetching error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while fetching jobs. Please try again.";
      throw new Error(errorMessage);
    }
  };

  // =====================================================================
  // TF-IDF + COSINE SIMILARITY ALGORITHM
  // =====================================================================
  // This algorithm ranks job postings by calculating semantic similarity
  // between your resume and job descriptions using:
  // 1. TF-IDF: Term Frequency - Inverse Document Frequency
  // 2. Cosine Similarity: Measures angle between document vectors
  // =====================================================================

  /**
   * Tokenize text into words (3+ characters, lowercase)
   */
  const tokenize = (text: string): string[] => {
    const matches = text.toLowerCase().match(/\b[a-z]{3,}\b/g);
    return matches ? Array.from(matches) : [];
  };

  /**
   * Calculate Term Frequency (TF) for a document
   * TF = (Number of times term appears in document) / (Total terms in document)
   */
  const calculateTF = (words: string[]): Map<string, number> => {
    const tf = new Map<string, number>();
    const totalWords = words.length;

    words.forEach((word) => {
      tf.set(word, (tf.get(word) || 0) + 1);
    });

    // Normalize by total word count
    tf.forEach((count, word) => {
      tf.set(word, count / totalWords);
    });

    return tf;
  };

  /**
   * Calculate Inverse Document Frequency (IDF)
   * IDF = log(Total documents / Documents containing term)
   * Higher IDF = term is more unique/important
   */
  const calculateIDF = (
    documents: string[][],
    vocabulary: Set<string>
  ): Map<string, number> => {
    const idf = new Map<string, number>();
    const totalDocs = documents.length;

    vocabulary.forEach((term) => {
      // Count how many documents contain this term
      const docsWithTerm = documents.filter((doc) => doc.includes(term)).length;

      // IDF formula: log(N / df) where N = total docs, df = docs with term
      // Add 1 to avoid division by zero
      const idfValue = Math.log(totalDocs / (docsWithTerm + 1));
      idf.set(term, idfValue);
    });

    return idf;
  };

  /**
   * Create TF-IDF vector for a document
   * TF-IDF = TF × IDF
   */
  const createTFIDFVector = (
    words: string[],
    vocabulary: string[],
    idf: Map<string, number>
  ): number[] => {
    const tf = calculateTF(words);
    const vector: number[] = [];

    vocabulary.forEach((term) => {
      const tfValue = tf.get(term) || 0;
      const idfValue = idf.get(term) || 0;
      vector.push(tfValue * idfValue);
    });

    return vector;
  };

  /**
   * Calculate Cosine Similarity between two vectors
   * Cosine Similarity = (A · B) / (||A|| × ||B||)
   * Range: 0 to 1, where 1 = identical, 0 = completely different
   */
  const calculateCosineSimilarity = (
    vectorA: number[],
    vectorB: number[]
  ): number => {
    if (vectorA.length !== vectorB.length || vectorA.length === 0) {
      return 0;
    }

    // Calculate dot product: A · B
    const dotProduct = vectorA.reduce(
      (sum, val, i) => sum + val * vectorB[i],
      0
    );

    // Calculate magnitudes: ||A|| and ||B||
    const magnitudeA = Math.sqrt(
      vectorA.reduce((sum, val) => sum + val * val, 0)
    );
    const magnitudeB = Math.sqrt(
      vectorB.reduce((sum, val) => sum + val * val, 0)
    );

    // Avoid division by zero
    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }

    // Cosine similarity formula
    return dotProduct / (magnitudeA * magnitudeB);
  };

  /**
   * Rank jobs using TF-IDF + Cosine Similarity
   * Returns jobs sorted by relevance score (0 to 1)
   */
  const rankJobs = (resume: string, jobList: Job[]): Job[] => {
    console.log("🚀 Starting TF-IDF + Cosine Similarity ranking...");
    console.log(`📄 Resume length: ${resume.length} chars`);
    console.log(`💼 Jobs to rank: ${jobList.length}`);

    // Step 1: Tokenize all documents
    const resumeWords = tokenize(resume);
    const jobDocuments = jobList.map((job) =>
      tokenize(`${job.title} ${job.description}`)
    );
    const allDocuments = [resumeWords, ...jobDocuments];

    console.log(`📝 Resume words: ${resumeWords.length}`);

    // Step 2: Build vocabulary (all unique words across all documents)
    const vocabulary = new Set<string>();
    allDocuments.forEach((doc) => {
      doc.forEach((word) => vocabulary.add(word));
    });
    const vocabArray = Array.from(vocabulary);

    console.log(`📚 Vocabulary size: ${vocabArray.length} unique words`);

    // Step 3: Calculate IDF for all terms
    const idf = calculateIDF(allDocuments, vocabulary);

    // Step 4: Create TF-IDF vector for resume
    const resumeVector = createTFIDFVector(resumeWords, vocabArray, idf);

    // Step 5: Calculate similarity scores for each job
    const scoredJobs = jobList.map((job, index) => {
      const jobWords = jobDocuments[index];
      const jobVector = createTFIDFVector(jobWords, vocabArray, idf);

      // Calculate cosine similarity
      const similarity = calculateCosineSimilarity(resumeVector, jobVector);

      console.log(
        `✓ ${job.title} at ${job.company}: ${(similarity * 100).toFixed(1)}% match`
      );

      return {
        ...job,
        score: similarity,
        matchPercentage: Math.round(similarity * 100), // Add human-readable percentage
      };
    });

    // Step 6: Sort by score (highest similarity first)
    const rankedJobs = scoredJobs.sort((a, b) => b.score - a.score);

    console.log("✅ Ranking complete!");
    console.log(
      `🏆 Top match: ${rankedJobs[0]?.title} (${rankedJobs[0]?.matchPercentage}%)`
    );

    return rankedJobs;
  };
  // ----------------------
  // Handle file upload
  // ----------------------
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== "application/pdf") {
      alert("Please upload a PDF file only.");
      return;
    }

    setUploadedFile(file);
    setIsLoading(true);
    setJobs([]);
    setRoleRecommendations(null);
    setResumeText("");
    setErrorMessage(null);

    try {
      const text = await extractPDFText(file);

      // Validate if it's a proper resume
      await validateResume(text);

      setResumeText(text);

      // Step 1: Generate role recommendations (parallel with keyword extraction)
      const [roleRecs, keywords] = await Promise.all([
        suggestJobRoles(text),
        extractKeywords(text),
      ]);

      console.log("Extracted keywords:", keywords);
      setRoleRecommendations(roleRecs);

      if (!keywords || keywords.length === 0) {
        throw new Error(
          "Failed to extract keywords from resume. Please try again.",
        );
      }

      // Step 2: Fetch and rank jobs
      const fetchedJobs = await fetchJobs(keywords);
      const rankedJobs = rankJobs(text, fetchedJobs);
      setJobs(rankedJobs);
      setErrorMessage(null);

      // If no jobs found, show info message but keep role recommendations
      if (rankedJobs.length === 0) {
        setInfoMessage(
          "No jobs found in Nepal or remote positions matching your profile at this time. This may be due to limited listings in the international job database.\n\n" +
          "We recommend checking these local job portals:\n" +
          "• Merojob.com - Nepal's largest job portal\n" +
          "• Kumarijob.com - Popular job site in Nepal\n" +
          "• JobsNepal.com - Local job listings\n" +
          "• Ramrojob.com - IT and tech jobs in Nepal\n" +
          "• LinkedIn Jobs - Filter by Nepal or Remote\n" +
          "• Remote.co - International remote opportunities"
        );
      } else {
        setInfoMessage(null);
      }
    } catch (err: any) {
      console.error("File upload error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again.";
      setErrorMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Script src="https://js.puter.com/v2/" strategy="afterInteractive" />
      <div className="dark:bg-main-gradient flex min-h-screen items-center justify-center pb-50 pt-[180px]">
        <div className="container max-w-5xl">
          <div className="mb-6 text-center">
            <h1 className="mb-2 bg-gradient-to-r from-cyan-400 via-teal-500 to-sky-500 bg-clip-text text-3xl font-light text-transparent lg:text-5xl">
              Job Recommender
            </h1>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">🇳🇵</span>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Finding jobs in Nepal
              </p>
              <span className="text-xl">+</span>
              <span className="text-2xl">🌐</span>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Remote opportunities
              </p>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Upload your resume PDF to get AI-powered job recommendations (Nepal-based + Remote jobs)
            </p>
          </div>

          {!uploadedFile &&
            !hasStoredResume &&
            !isLoading &&
            jobs.length === 0 && (
              <div className="upload-area text-center">
                <h3 className="mb-2 text-xl text-slate-700 dark:text-slate-200">
                  Upload your resume
                </h3>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  disabled={!aiReady}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className={`btn-primary inline-block ${!aiReady ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  Choose PDF File
                </label>
              </div>
            )}

          {isLoading && (
            <div className="mt-8 text-center">
              <div className="loading-spinner mx-auto mb-4"></div>
              <p className="text-lg text-slate-200">
                Analyzing your resume and finding job recommendations...
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="mt-6 rounded border border-red-500 bg-red-50 p-6 text-red-800 dark:bg-red-900/20 dark:text-red-200">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                <strong className="text-lg">Error</strong>
              </div>
              <div className="whitespace-pre-line text-sm leading-relaxed">
                {errorMessage}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* CAREER ROLE RECOMMENDATIONS UI - Modern & Minimal */}
          {/* ===================================================================== */}
          {roleRecommendations && !errorMessage && (
            <div className="mt-8 mb-8">
              <div className="mx-auto max-w-4xl rounded-xl border border-slate-300 bg-gradient-to-br from-white to-slate-50 p-8 shadow-lg dark:border-slate-700 dark:from-slate-900 dark:to-slate-800">
                {/* Header */}
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-2xl shadow-lg">
                    💼
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                      Career Recommendations
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Based on your experience and skills
                    </p>
                  </div>
                </div>

                {/* Summary */}
                <div className="mb-6 rounded-lg bg-slate-100/50 p-4 dark:bg-slate-800/50">
                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    {roleRecommendations.summary}
                  </p>
                </div>

                {/* Experience & Skills Pills */}
                <div className="mb-6 flex flex-wrap gap-2">
                  {roleRecommendations.experienceYears && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                      ⏱️ {roleRecommendations.experienceYears}
                    </span>
                  )}
                  {roleRecommendations.keySkills?.slice(0, 5).map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Primary Role - Highlighted */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">⭐</span>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                      Best Match
                    </h3>
                  </div>
                  <div className="group relative overflow-hidden rounded-lg border-2 border-cyan-500 bg-gradient-to-r from-cyan-50 to-blue-50 p-5 transition-all hover:shadow-xl dark:from-cyan-900/20 dark:to-blue-900/20">
                    <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-cyan-500 to-blue-600"></div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                          {roleRecommendations.primaryRole}
                        </h4>
                        <p className="mt-1 text-sm font-medium text-cyan-600 dark:text-cyan-400">
                          {roleRecommendations.level} Position
                        </p>
                      </div>
                      <div className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-bold text-white shadow-lg">
                        Primary
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alternative Roles */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">📌</span>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                      Alternative Roles
                    </h3>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {roleRecommendations.alternativeRoles.map((role, idx) => (
                      <div
                        key={idx}
                        className="group rounded-lg border border-slate-300 bg-white p-4 transition-all hover:border-blue-400 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-blue-500"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                            {idx + 1}
                          </div>
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                            {role}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Info Footer */}
                <div className="mt-6 flex items-center gap-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                  <span className="text-lg">💡</span>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    These recommendations are based on AI analysis of your resume.
                    Job listings below are ranked by relevance to your profile.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* INFO MESSAGE - No Jobs Found (but show recommendations) */}
          {/* ===================================================================== */}
          {infoMessage && roleRecommendations && !errorMessage && (
            <>
              <div className="mt-6 rounded-lg border border-blue-400 bg-blue-50 p-6 text-blue-800 dark:border-blue-600 dark:bg-blue-900/20 dark:text-blue-200">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-2xl">ℹ️</span>
                  <strong className="text-lg">Job Search Update</strong>
                </div>
                <div className="whitespace-pre-line text-sm leading-relaxed">
                  {infoMessage}
                </div>
                <div className="mt-4 rounded-md bg-blue-100 p-3 dark:bg-blue-900/30">
                  <p className="text-xs font-medium text-blue-900 dark:text-blue-100">
                    💡 Good news: We've analyzed your profile and identified suitable roles for you above.
                    Use these recommendations when searching on the job portals listed.
                  </p>
                </div>
              </div>

              {/* Reset button when no jobs found */}
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={reset}
                  className="cursor-pointer rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Try Another Resume
                </button>
              </div>
            </>
          )}

          {jobs.length > 0 && (uploadedFile || resumeText) && (
            <>
              <div className="mt-24 grid gap-24 sm:grid-cols-2 lg:grid-cols-3">
                {jobs.map((job, i) => {
                  // Determine badge color based on match percentage
                  const getMatchColor = (percentage: number) => {
                    if (percentage >= 80) return "bg-green-500/20 text-green-700 border-green-500/30";
                    if (percentage >= 60) return "bg-blue-500/20 text-blue-700 border-blue-500/30";
                    if (percentage >= 40) return "bg-yellow-500/20 text-yellow-700 border-yellow-500/30";
                    return "bg-orange-500/20 text-orange-700 border-orange-500/30";
                  };

                  const matchPercentage = job.matchPercentage || 0;
                  const matchColor = getMatchColor(matchPercentage);

                  return (
                    <div
                      key={i}
                      className="relative rounded-xl border border-slate-700 p-24 shadow-lg dark:bg-slate-900 dark:text-slate-100 transition-transform hover:scale-105"
                    >
                      {/* Match Percentage Badge */}
                      <div className="absolute top-3 right-3">
                        <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${matchColor}`}>
                          {matchPercentage >= 80 && "🎯"}
                          {matchPercentage >= 60 && matchPercentage < 80 && "✨"}
                          {matchPercentage >= 40 && matchPercentage < 60 && "👍"}
                          {matchPercentage < 40 && "📌"}
                          {matchPercentage}% Match
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold pr-24">{job.title}</h3>
                      <p className="text-sm text-cyan-600 dark:text-slate-400">
                        {job.company}
                      </p>
                      <div className="mb-3 flex items-center gap-2">
                        <p className="text-xs text-cyan-700 dark:text-slate-500">
                          {job.location}
                        </p>
                        {job.isRemote && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 px-2 py-0.5 text-xs font-medium text-purple-700 dark:text-purple-300 border border-purple-500/30">
                            🌐 Remote
                          </span>
                        )}
                      </div>
                      <p className="mb-3 line-clamp-4 text-sm">
                        {job.description.slice(0, 200)}...
                      </p>
                      <a
                        href={job.apply_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-md text-cyan-800 underline dark:text-cyan-400 hover:text-cyan-600"
                      >
                        Apply Now →
                      </a>
                    </div>
                  );
                })}
              </div>
              <div className="mt-24 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={reset}
                  className="cursor-pointer rounded-xl border border-red-500/30 bg-red-500 px-24 py-12 text-lg text-red-100 transition hover:bg-red-500/30 dark:bg-red-500/20 dark:text-red-300"
                >
                  Reset
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
