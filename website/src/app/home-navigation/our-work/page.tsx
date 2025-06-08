"use client";

// Section: Projects Data
const projects = [
  {
    image: "placeholderimage.png",
    title: "Office Redesign",
    description:
      "A perfect blend of functionality and aesthetics for modern workspaces.",
  },
  {
    image: "placeholderimage.png",
    title: "Team Collaboration",
    description:
      "Innovative solutions tailored to enhance teamwork and productivity.",
  },
  {
    image: "placeholderimage.png",
    title: "Client Feedback",
    description:
      "Delivering exceptional results and receiving positive feedback from clients.",
  },
  {
    image: "placeholderimage.png",
    title: "Project Alpha",
    description:
      "Exploring new horizons with cutting-edge technology.",
  },
  {
    image: "placeholderimage.png",
    title: "Project Beta",
    description:
      "Innovative solutions for modern challenges.",
  },
  {
    image: "placeholderimage.png",
    title: "Project Gamma",
    description:
      "Collaborative efforts delivering exceptional results.",
  },
  {
    image: "placeholderimage.png",
    title: "Project Delta",
    description:
      "Empowering businesses with tailored solutions.",
  },
];

export default function OurWork() {
  // Section: Page Layout
  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20">
      <section className="max-w-6xl mx-auto text-center">
        <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 leading-tight">
          Our Work
        </h1>
        <p className="text-lg sm:text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
          Discover the projects and initiatives that showcase our commitment to
          excellence and innovation.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {projects.slice(0, 4).map((project, index) => (
            <div
              key={index}
              className="rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div className="flex items-center justify-center w-full h-80 bg-gray-100">
                <img
                  src={`/homepage-our-work/${project.image}`}
                  alt={project.title}
                  className="w-60 h-60 object-contain"
                />
              </div>
              <div className="p-6 bg-white">
                <h3 className="text-2xl font-bold mb-4">{project.title}</h3>
                <p className="text-gray-600 text-lg">{project.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 justify-center mt-8">
          {projects.slice(4).map((project, index) => (
            <div
              key={index}
              className="rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div className="flex items-center justify-center w-full h-80 bg-gray-100">
                <img
                  src={`/homepage-our-work/${project.image}`}
                  alt={project.title}
                  className="w-60 h-60 object-contain"
                />
              </div>
              <div className="p-6 bg-white">
                <h3 className="text-2xl font-bold mb-4">{project.title}</h3>
                <p className="text-gray-600 text-lg">{project.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
