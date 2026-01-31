import { motion } from "framer-motion";
import { Fingerprint, KeyRound, ShieldCheck } from "lucide-react";

const steps = [
  {
    icon: Fingerprint,
    title: "Register Device",
    description: "Create a secure passkey using your device's biometrics or PIN. No password to remember.",
    color: "primary",
  },
  {
    icon: KeyRound,
    title: "Cryptographic Proof",
    description: "Your device signs a unique challenge with your private key. Only you can prove your identity.",
    color: "accent",
  },
  {
    icon: ShieldCheck,
    title: "Secure Access",
    description: "Server verifies your signature with your public key. Authentication complete in milliseconds.",
    color: "success",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50, rotateX: -15 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export const HowItWorksSection = () => {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />

      <div className="relative z-10 container mx-auto px-4">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
            How It <span className="text-primary">Works</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Three simple steps to passwordless security
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto perspective-1000"
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              variants={cardVariants}
              whileHover={{
                y: -10,
                rotateY: 5,
                transition: { duration: 0.3 },
              }}
              className="group relative"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="glass rounded-2xl p-8 h-full border border-border/50 hover:border-primary/30 transition-colors duration-300">
                {/* Step number */}
                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold">{index + 1}</span>
                </div>

                {/* Icon */}
                <div className={`mb-6 inline-flex p-4 rounded-xl bg-${step.color}/10 group-hover:bg-${step.color}/20 transition-colors`}>
                  <step.icon
                    className={`w-8 h-8 ${
                      step.color === "primary"
                        ? "text-primary"
                        : step.color === "accent"
                        ? "text-accent"
                        : "text-success"
                    }`}
                  />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold mb-3 text-foreground">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>

                {/* Glow effect on hover */}
                <div
                  className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl ${
                    step.color === "primary"
                      ? "bg-primary/20"
                      : step.color === "accent"
                      ? "bg-accent/20"
                      : "bg-success/20"
                  }`}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Connection lines (desktop only) */}
        <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>
    </section>
  );
};
