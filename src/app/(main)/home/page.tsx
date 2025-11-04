"use client";
import testimonialSwiper, { initAos } from "@/lib/utils";
import { useEffect } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { teamMembers } from "./data";
export default function HomePage() {
  useEffect(() => {
    initAos();
    testimonialSwiper();
  }, []);
  return (
    <div className="page-holder">
      <main className="main" id="main">
        <section
          className="hero-section pb-[53px] pt-[55px] lg:pb-[40px] lg:pt-[80px] xl:pb-[73px] xl:pt-[203px]"
          id="hero"
        >
          <div className="container max-w-[1440px]">
            <div
              className="hero__top relative md:mb-9 md:flex md:flex-row lg:mb-9 lg:block lg:max-w-[75%]"
              data-aos="fade-up"
            >
              <div className="hero__top-text overflow-hidden pt-[85px] uppercase lg:order-1 lg:pr-[190px] lg:pt-0 xl:pr-[214px]">
                <h1 className="mb-0 text-40 font-bold leading-[1.1] dark:text-white lg:text-75 xl:text-105">
                  Your Career,
                </h1>
                <div className="hero__top-icon absolute left-0 top-0 lg:left-auto lg:right-0 lg:ml-15 lg:pt-5">
                  {/* <figure className="overflow-hidden rounded-[90px] w-full max-w-[143px] lg:max-w-[180px] xl:max-w-[214px] mb-16 ">
                    <img className="object-cover w-full h-auto " src="./images/hero/hero-icon.png" alt="Hero Image">
                  </figure> */}
                </div>
              </div>
              <div className="hero__top-span text-14 font-normal uppercase leading-[1.4]">
                <span className="absolute right-0 top-0 dark:text-white lg:hidden">
                  EST 2025
                </span>
              </div>
            </div>
            <div
              className="hero__bottom mb-32 flex flex-col items-start lg:mx-[-12px] lg:mb-16 lg:flex-row"
              data-aos="fade-up"
            >
              <div className="hero__bottom-detail order-3 lg:order-1 lg:flex lg:w-[38.5%] lg:flex-col lg:px-12 lg:pt-15">
                <div className="order-3 pt-12 text-14 uppercase leading-[1.4] lg:flex lg:min-h-[180px] lg:items-end lg:pr-[120px] lg:pt-0">
                  <p>COPYRIGHT &copy; JOBSTACK 2025</p>
                </div>
                <span className="lh-1_4 hidden items-end text-14 font-normal lg:inline-block lg:w-full lg:text-end">
                  EST 2025
                </span>
              </div>
              <div className="order-1 mb-24 text-40 font-bold uppercase leading-[1.1] lg:mb-8 lg:w-[91%] lg:px-12 lg:text-75 xl:text-105">
                <h1>We Empower Careers</h1>
              </div>
              <div className="order-2 mb-12 text-14 leading-[1.6] lg:flex lg:min-h-[216px] lg:w-1/4 lg:items-end lg:px-12 lg:text-start">
                <p>
                  Build your resume, analyze your skills, and get AI-driven job
                  recommendations — all in one platform.
                </p>
              </div>
            </div>
            <div className="hero__image" data-aos="fade-up">
              <figure className="relative h-full min-h-[232px] w-full sm:min-h-[330px] md:min-h-[550px] lg:min-h-[770px]">
                <Image
                  className="absolute left-0 top-0 h-full w-full rounded-16 object-cover lg:rounded-24"
                  src="/hero.png"
                  alt="Hero Image"
                  fill
                ></Image>
              </figure>
            </div>
          </div>
        </section>

        <section
          className="about-section counter-increment pb-[22px] pt-[60px] lg:pb-[100px] xl:pb-[146px]"
          id="about"
        >
          <div className="container max-w-[1440px]">
            <div className="about__top relative mb-31 lg:mb-[70px]">
              <div
                className="about__top-title mb-16 w-1/2 text-14 font-normal uppercase leading-[1.4]"
                data-aos="fade-up"
              >
                <span>JOBSTACK — YOUR CAREER COMPANION</span>
              </div>
              <div className="counter about__top-counter leading-[1.4] before:absolute before:right-0 before:top-0 before:inline-block before:rounded-[50px] before:border-[1px] before:border-primary before:px-16 before:py-4 before:content-[counter(section-counter,decimal-leading-zero)]">
                <span></span>
              </div>
              <div
                className="about__top-image mb-30 max-w-[160px] lg:max-w-[336px]"
                data-aos="fade-up"
              >
                {/* <figure className="relative overflow-hidden w-full h-full min-h-[180px] lg:min-h-[370px] lg:float-left lg:mr-25">
                  <img className="absolute right-0 top-0 rounded-16 w-full h-full object-cover " src="./images/about/office.png" alt="Main Office Image">
                </figure> */}
              </div>
              <div
                className="about__top-description pr-0 pt-0 text-32 font-bold leading-[1.2] lg:pr-[30px] lg:pt-[21%] lg:text-[44px] xl:lg:text-[56px] xl:pr-[200px]"
                data-aos="fade-up"
              >
                <h2>
                  Empowering Students and Graduates — Your Bridge to Job
                  Opportunities and Career Growth.
                </h2>
              </div>
            </div>
            <div
              className="about__bottom mb-32 flex flex-col justify-between lg:mx-[-72px] lg:flex-row"
              data-aos="fade-up"
            >
              <div className="title about__bottom-title order-2 mb-32 text-14 font-normal uppercase leading-normal lg:order-1 lg:w-[23%] lg:px-[72px]">
                <span>ABOUT US</span>
              </div>
              <div
                className="about__bottom-description order-3 lg:order-2 lg:w-[54%] lg:px-[72px]"
                data-aos="fade-up"
              >
                <div className="description__text mb-32 text-14 font-normal leading-[1.56] lg:mb-73">
                  <p className="mb-16">
                    JobStack is a college-driven initiative designed to connect
                    students and fresh graduates with meaningful job
                    opportunities. Our platform streamlines job discovery,
                    application processes, and career readiness for young
                    talents entering the workforce.
                  </p>
                  <p className="mb-16">
                    Backed by modern technology and a student-first approach, we
                    aim to foster a culture of growth, networking, and success —
                    helping users build strong resumes, discover internships,
                    and land their dream jobs.
                  </p>
                </div>
                <div className="description__info mx-[-35px] flex flex-wrap lg:mx-[-24px] lg:w-full lg:flex-row xl:mx-[-19px]">
                  <div className="description__info-item mb-16 flex w-[44%] flex-col flex-wrap px-35 uppercase lg:w-[50%] lg:px-19 xl:w-[29%]">
                    <span className="top-info mb-8 inline-block text-32 font-semibold leading-1.2 lg:text-48">
                      500+
                    </span>
                    <span className="bottom-info inline-block text-13 font-normal uppercase leading-1.4 lg:text-14">
                      STUDENT USERS
                    </span>
                  </div>
                  <div className="description__info-item mb-16 flex w-[56%] flex-col flex-wrap px-35 uppercase lg:w-[50%] lg:px-19 xl:w-[31%]">
                    <span className="top-info mb-8 inline-block text-32 font-semibold leading-1.2 lg:text-48">
                      100+
                    </span>
                    <span className="bottom-info inline-block text-13 font-normal uppercase leading-1.4 lg:text-14">
                      JOBS POSTED
                    </span>
                  </div>
                  <div className="description__info-item mb-16 flex w-[100%] flex-col flex-wrap px-35 uppercase lg:w-[50%] lg:px-19 xl:w-[35%]">
                    <span className="top-info mb-8 inline-block text-32 font-semibold leading-1.2 lg:text-48">
                      95%
                    </span>
                    <span className="bottom-info inline-block text-13 font-normal uppercase leading-1.4 lg:text-14">
                      POSITIVE FEEDBACK
                    </span>
                  </div>
                </div>
              </div>
              <div className="about__bottom-award order-1 mx-[-6px] mb-31 flex flex-wrap items-center sm:mx-0 lg:order-3 lg:w-[23%] lg:flex-col lg:items-end lg:px-[72px]">
                <div className="award__image max-h-full w-auto px-6 lg:mr-20 lg:px-0">
                  {/* <figure>
                    <img src="./images/about/award.png" alt="Award Image">
                  </figure> */}
                </div>
                <span className="max-w-[116px] px-6 text-14 font-normal leading-normal lg:px-0 lg:pt-8 xl:max-w-[96px]">
                  For your easiness
                </span>
              </div>
            </div>
          </div>
        </section>
        <section
          className="service-section counter-increment overflow-hidden bg-primary pb-28 pt-[60px] text-white dark:bg-transparent lg:pb-[100px] lg:pt-[100px] xl:pb-[134px] xl:pt-[129px]"
          id="service"
        >
          <div className="container max-w-[1440px]">
            <div
              className="section-top relative mb-32 lg:mx-[-12px] lg:mb-64 lg:flex"
              data-aos="fade-up"
            >
              <div className="section-title mb-36 w-1/2 text-14 font-normal uppercase leading-normal lg:w-1/4 lg:px-12">
                <span>OUR SERVICES</span>
              </div>
              <div className="section-content text-32 font-bold leading-1.2 lg:w-[67%] lg:px-12 lg:text-56">
                <h2>
                  Empowering Your Career with JobStack’s Comprehensive Job
                  Solutions
                </h2>
              </div>
              <div className="counter lg:w-[8%] lg:px-12">
                <span className="leading-[1.4] before:absolute before:right-0 before:top-0 before:inline-block before:rounded-[50px] before:border-[1px] before:border-secondary before:px-14 before:py-0 before:content-[counter(section-counter,decimal-leading-zero)] lg:before:right-12"></span>
              </div>
            </div>
          </div>

          <div className="slider-wrapper relative mb-31 flex lg:mb-80">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="service__center relative flex min-w-full shrink-0 animate-scroll flex-nowrap items-center justify-around gap-100 pr-100 uppercase"
                data-aos="fade-up"
              >
                <div className="service__center-left inline-block whitespace-nowrap text-150 font-bold leading-0.8 lg:text-350">
                  <span>JOBSTACK SERVICES</span>
                </div>
                <div className="service__center-right inline-block whitespace-nowrap text-150 font-bold leading-0.8 lg:text-350">
                  <span>JOBSTACK SERVICES</span>
                </div>
              </div>
            ))}
          </div>

          <div className="container max-w-[1440px]">
            <div
              className="service__bottom service-reset mb-26 flex lg:mb-45 lg:flex-row"
              data-aos="fade-up"
            >
              <div className="section-title title lg:w-[26%]"></div>
              <div className="section-content lg:w-[69%]">
                <div className="row service__row service-counter-reset l md:mx-[-12px] md:flex md:flex-wrap">
                  {[
                    {
                      title: "Job Listings & Alerts",
                      desc: "Access thousands of job listings daily and receive personalized alerts to never miss an opportunity.",
                    },
                    {
                      title: "Resume & Profile Building",
                      desc: "Create a standout resume and professional profile to impress potential employers and recruiters.",
                    },
                  ].map((service, i) => (
                    <div
                      key={i}
                      className="col col__wrapper service-counter-increment mb-24 md:w-1/2 md:px-12"
                    >
                      <div
                        className="service__col bg-bgcolor-2 flex h-full flex-col justify-between rounded-16 px-24 py-24"
                        data-aos="fade-up"
                      >
                        <div className="service__col-title relative mb-16 flex flex-wrap lg:mb-24">
                          <h3 className="w-70 text-22 font-bold leading-1.4 text-secondary lg:w-80 lg:text-28">
                            {service.title}
                          </h3>
                          <div className="counter service__col-counter">
                            <span className="before:absolute before:right-0 before:top-0 before:inline-block before:rounded-[50px] before:border-[1px] before:border-secondary before:px-14 before:py-2 before:text-14 before:font-normal before:leading-1.4 before:text-secondary before:content-[counter(service-counter,decimal-leading-zero)] md:before:top-6"></span>
                          </div>
                        </div>
                        <div className="service__col-description mb-16 text-14 leading-normal lg:mb-24">
                          <p className="m-0">{service.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="section-counter lg:w-[8%]"></div>
            </div>
          </div>
        </section>

        <section
          className="testimonial-section counter-increment border-t border-solid border-secondary border-opacity-20 bg-primary pb-26 pt-60 text-secondary dark:bg-transparent dark:text-white lg:pb-40 lg:pt-[100px] xl:pb-55 xl:pt-[132px]"
          id="testimonial"
        >
          <div className="container max-w-[1440px]">
            <div
              className="testimonial__top relative mb-32 flex lg:mx-[-12px] lg:mb-76 lg:flex"
              data-aos="fade-up"
            >
              <div className="testimonial__top-title text-14 font-normal uppercase leading-normal lg:w-1/4 lg:px-12">
                <span>TESTIMONIALS</span>
              </div>
              <div className="testimonial__top-content hidden text-14 font-normal uppercase leading-1.4 lg:flex lg:w-[67%] lg:px-12">
                <p>COPYRIGHT &copy; JOBSTACK 2024</p>
              </div>
              <div className="counter testimonial__top-counter lg:w-[8%] lg:px-12">
                <span className="leading-[1.4] before:absolute before:right-0 before:top-0 before:inline-block before:rounded-[50px] before:border-[1px] before:border-secondary before:px-16 before:py-1 before:text-secondary before:content-[counter(section-counter,decimal-leading-zero)] lg:before:right-12"></span>
              </div>
            </div>

            <div
              className="testimonial__bottom mx-[-10px] mb-27 lg:mb-67 lg:flex"
              data-aos="fade-up"
            >
              <div className="section-title title testimonial__bottom-title px-10 lg:w-1/4"></div>
              <div className="testimonial__bottom-content lg:flex lg:w-[66%]">
                <div className="swiper testimonial__swiper w-full lg:px-0">
                  <div className="swiper-wrapper">
                    {[
                      {
                        quote:
                          "JobStack helped me find my dream job quickly. The platform is easy to use and the job alerts kept me updated.",
                        name: "Sara Williams",
                        position: "Software Engineer",
                      },
                      {
                        quote:
                          "As an employer, JobStack simplified our recruitment process and connected us with qualified candidates fast.",
                        name: "Michael Brown",
                        position: "HR Manager",
                      },
                      {
                        quote:
                          "The skill development courses recommended by JobStack boosted my confidence and prepared me for interviews.",
                        name: "Anita Singh",
                        position: "Marketing Specialist",
                      },
                      {
                        quote:
                          "Great platform with excellent support. JobStack made job searching less stressful and more efficient!",
                        name: "David Lee",
                        position: "Data Analyst",
                      },
                    ].map(({ quote, name, position }, i) => (
                      <div className="swiper-slide px-12" key={i}>
                        <div
                          className="testimonial__slider relative flex flex-col items-center lg:w-full"
                          data-aos="fade-up"
                        >
                          <figure>
                            <blockquote className="testimonial m-0 mb-35 text-32 font-bold leading-1.2 lg:mb-50 lg:text-56">
                              “{quote}”
                            </blockquote>
                            <figcaption className="testimonial__user mx-[-8px] mb-85 flex w-full pr-15 lg:mb-[120px] lg:pl-3">
                              <div className="testimonial__user-image px-8">
                                {/* Optionally add user image here */}
                              </div>
                              <div className="testimonial__user-detail flex flex-col flex-wrap px-8 lg:pb-6">
                                <span className="user-name mb-4 text-14 font-bold leading-normal">
                                  {name}
                                </span>
                                <span className="user-position mb-8 text-14 font-normal leading-normal">
                                  {position}
                                </span>
                              </div>
                            </figcaption>
                          </figure>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="swiper-pagination absolute bottom-[1%] left-auto right-10 mb-8 inline-block h-auto w-auto rounded-50 border border-secondary px-12 py-2 sm:bottom-[4%] sm:mb-0 md:bottom-[4%] lg:bottom-[3%] lg:right-0"></div>

                  <div className="swiper-navigation absolute bottom-[1%] left-0 flex h-[66px] w-[144px]">
                    <div className="swiper-button-prev flex h-56 w-56 items-center justify-center rounded-[50%] border border-solid border-secondary border-opacity-20 after:hidden">
                      {/* SVG icon can be added here */}
                      <ArrowLeft />
                    </div>
                    <div className="swiper-button-next flex h-56 w-56 items-center justify-center rounded-[50%] border border-solid border-secondary border-opacity-20 after:hidden">
                      {/* SVG icon can be added here */}
                      <ArrowRight />
                    </div>
                  </div>

                  <div className="swiper-scrollbar"></div>
                </div>
              </div>
              <div className="testimonial__bottom-text lg:w-[9%] lg:px-10"></div>
            </div>
          </div>
        </section>

        <section
          className="team-section counter-increment pb-53 pt-58 lg:pb-[120px] lg:pt-[90px]"
          id="team"
        >
          <div className="container max-w-[1440px]">
            <div
              className="team__top relative mb-32 lg:mx-[-12px] lg:mb-8 lg:flex"
              data-aos="fade-up"
            >
              <div className="title team__top-title mb-36 text-14 font-normal uppercase leading-normal lg:mb-0 lg:w-1/4 lg:px-12">
                <span>OUR TEAM</span>
              </div>
              <div className="team__top-content mb-30 lg:mb-68 lg:w-[68%] lg:px-12">
                <h2 className="mb-30 text-32 font-bold leading-1.2 lg:mb-68 lg:text-56">
                  Meet the experts powering your job search and resume success.
                </h2>
                <div className="team-description text-14 font-normal leading-normal lg:pr-20">
                  <p>
                    Our dedicated team combines expertise in software
                    development, career coaching, and data analysis to build
                    JobStack — your trusted partner in creating resumes,
                    analyzing skills, and recommending the perfect jobs for you.
                  </p>
                </div>
              </div>
              <div className="team__top-counter w-[7%] lg:px-12">
                <span className="leading-[1.4] before:absolute before:right-0 before:top-0 before:inline-block before:rounded-[50px] before:border-[1px] before:border-primary before:px-16 before:py-4 before:text-14 before:font-normal before:text-primary before:content-[counter(section-counter,decimal-leading-zero)] before:lg:right-12"></span>
              </div>
            </div>
            <div className="team__bottom">
              <div className="team__row team-counter-reset lg:8 mx-[-12px] flex flex-wrap pr-7 lg:mb-48">
                {teamMembers.map((member, index) => (
                  <div
                    className="col team__col group/team mb-9 max-h-[100%] w-full px-12 transition-all duration-600 ease-in sm:w-1/2 lg:mb-0 lg:w-1/3 xl:w-1/4"
                    data-aos="fade-up"
                    key={index}
                  >
                    <div className="team__wrapper team-counter-increment relative h-full">
                      <div className="counter team__wrapper-counter mb-24 h-23">
                        <span className="leading-[1.4] before:absolute before:left-0 before:top-0 before:inline-block before:rounded-[50px] before:border-[1px] before:border-primary before:px-14 before:py-4 before:text-14 before:font-normal before:leading-1.4 before:text-primary before:content-[counter(team-counter,decimal-leading-zero)]"></span>
                      </div>
                      <div className="team__wrapper-list">
                        <a
                          href="#"
                          aria-label="Doctor"
                          className="team__list no-underline"
                        >
                          <div className="team__list-image mb-27 transition-all duration-500 ease-in-out lg:mb-29">
                            <figure className="relative mb-24 h-[230px] w-full overflow-hidden transition-all duration-600 ease-in-out group-hover/team:h-[278px] lg:h-[370px]">
                              <Image
                                src={member.image}
                                alt={member.name}
                                fill
                                className="absolute left-0 top-0 h-full w-full rounded-[16px] object-cover"
                                priority
                              />
                            </figure>
                          </div>
                          <div className="team__list-detail relative mx-[-10px] flex flex-wrap justify-between transition-all duration-600 ease-in-out group-hover/team:pb-70">
                            <h3 className="team__name w-[54%] px-10 text-22 font-bold uppercase leading-1.3 lg:text-24">
                              {member.name}
                            </h3>
                            <p className="team__position font-400 flex w-[46%] items-end justify-end px-10 text-14 uppercase leading-1.4 opacity-[50%]">
                              {member.role}
                            </p>
                          </div>
                          <div className="team__list-about mb-0 line-clamp-2 overflow-hidden pb-0 text-14 font-normal uppercase leading-1.4 text-primary opacity-0 transition-all duration-600 ease-in-out group-hover/team:visible group-hover/team:opacity-100">
                            <span>{member.about}</span>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        <section
          className="contact-section counter-increment bg-bgcolor-3 pb-55 pt-60 lg:pb-[130px] lg:pt-[90px] xl:pb-[174px] xl:pt-[127px]"
          id="contact"
        >
          <div className="container max-w-[1440px]">
            <div
              className="section-top contact__top relative mb-32 flex flex-col lg:mx-[-12px] lg:mb-55 lg:flex-row"
              data-aos="fade-up"
            >
              <div className="section-title title contact__top-title mb-36 text-14 font-normal uppercase leading-normal lg:mb-39 lg:w-1/4 lg:px-12">
                <span>GET IN TOUCH</span>
              </div>
              <div className="section-content contact__top-content leading-1.6 text-14 font-normal lg:w-[67%] lg:px-12">
                <p className="max-w-[456px]">
                  Have questions about building or analyzing your resume? Need
                  help finding the right job? Our team is here to support you
                  every step of the way.
                </p>
              </div>
              <div className="section-counter counter contact__top-counter lg:w-[8%] lg:px-12">
                <span className="leading-[1.4] before:absolute before:right-0 before:top-0 before:inline-block before:rounded-[50px] before:border-[1px] before:border-primary before:px-14 before:py-1 before:content-[counter(section-counter,decimal-leading-zero)] lg:before:right-12"></span>
              </div>
            </div>
            <div
              className="contact__us relative mb-34 pt-86 text-40 font-bold uppercase leading-1 lg:mb-86 lg:pt-0 lg:text-105 xl:px-[120px]"
              data-aos="fade-up"
            >
              <span className="align-middle">Contact JOBSTACK</span>
            </div>

            <div
              className="contact__button flex justify-center lg:relative"
              data-aos="fade-right"
            >
              <a
                href="#"
                className="btn btn-secondary w-full rounded-[66px] border border-primary bg-primary px-44 py-12 text-center text-16 font-bold leading-normal text-secondary transition-colors duration-700 hover:bg-inherit hover:text-primary lg:absolute lg:left-1/4 lg:top-0 lg:w-auto"
                aria-label="Contact support"
              >
                Contact support
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
