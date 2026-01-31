import { motion } from "framer-motion";
import { XCircle, Lock, Server, Shield } from "lucide-react";

const guarantees = [
  {
    icon: XCircle,
    title: "No Passwords",
    description: "Passwords are never created, stored, or transmitted. There's nothing to steal, phish, or forget.",
    visual: "password-crossed",
  },
  {
    icon: Lock,
    title: "Key Stays on Device",
    description: "Your private key never leaves your device. It's protected by your device's secure hardware (TPM/Secure Enclave).",
    visual: "key-device",
  },
  {
    icon: Server,
    title: "Breach-Safe Server",
    description: "We only store your public key. Even if our database is compromised, attackers cannot impersonate you.",
    visual: "public-key",
  },
  {
    icon: Shield,
    title: "Phishing Resistant",
    description: "Credentials are bound to our domain. They simply won't work on fake lookalike sites.",
    visual: "phishing-proof",
  },
];

export const SecuritySection = () => {
  return (
    <section id="security" className="relative py-24 md:py-32 overflow-hidden">
      {/* Grid background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }} />
      </div>

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
            Security <span className="text-primary">Guarantees</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Built on cryptographic principles that eliminate entire classes of attacks
          </p>
        </motion.div>

        {/* Guarantees grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {guarantees.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="glass rounded-xl p-6 h-full border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                <div className="flex items-start gap-4">
                  {/* Icon with animation */}
                  <div className="relative">
                    <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    {/* Animated ring */}
                    <motion.div
                      className="absolute inset-0 rounded-lg border-2 border-primary/30"
                      initial={{ scale: 1, opacity: 0 }}
                      whileHover={{ scale: 1.2, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Visual indicator line */}
                <motion.div
                  className="mt-4 h-1 rounded-full bg-gradient-to-r from-primary/50 to-accent/50"
                  initial={{ scaleX: 0, originX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground mb-4">
            Want to see how we defend against specific attacks?
          </p>
          <a
            href="#demo"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
          >
            View Attack Simulations
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.span>
          </a>
        </motion.div>
      </div>
    </section>
  );
};
