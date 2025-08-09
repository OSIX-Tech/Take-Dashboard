import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'

export const AnimatedCard = ({ children, index = 0, className = '', ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        ease: [0.4, 0, 0.2, 1]
      }}
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 }
      }}
      className={className}
    >
      <Card {...props} className={`transition-shadow duration-300 ${props.className || ''}`}>
        {children}
      </Card>
    </motion.div>
  )
}

export default AnimatedCard