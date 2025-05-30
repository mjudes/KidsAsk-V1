/**
 * local_ai_service.js
 * 
 * Provides local response generation for KidsAsk without relying on external AI services
 */
const logger = require('../config/logger');

/**
 * Map of topic IDs to basic response templates
 */
const topicResponses = {
  1: [
    "Animals are fascinating creatures! They come in all shapes and sizes, from tiny insects to massive whales. Some animals have fur, some have scales, and others have feathers.",
    "Did you know that there are over 1 million known animal species on Earth? Scientists discover new ones every year!",
    "Many animals have amazing adaptations that help them survive. For example, giraffes have long necks to reach leaves high in trees, and cheetahs can run super fast to catch their prey.",
    "Animals communicate in different ways - some use sounds, others use body language, and some even use colors or smells!",
  ],
  2: [
    "Space is incredibly vast! Our solar system is just a tiny part of the Milky Way galaxy, and there are billions of galaxies in the universe.",
    "Planets orbit around stars, like how Earth orbits around our Sun. Each planet is unique - some are rocky like Earth, while others are made mostly of gas, like Jupiter.",
    "Stars are giant balls of hot gas that produce light and heat. Our Sun is actually a medium-sized star!",
    "Astronauts who visit space need special spacesuits to protect them since there's no air to breathe in space.",
  ],
  3: [
    "The human body is like an amazing machine with many different systems working together. Your heart pumps blood, your lungs help you breathe, and your brain controls everything!",
    "Your body has over 600 muscles that help you move, and more than 200 bones that give your body structure and protect important organs.",
    "The skin is your body's largest organ! It protects everything inside from germs and helps control your body temperature.",
    "Your five senses - sight, hearing, smell, taste, and touch - help you understand the world around you.",
  ],
  4: [
    "Dinosaurs lived on Earth for about 165 million years, but went extinct about 65 million years ago. That's long before humans existed!",
    "Some dinosaurs were huge - like Brachiosaurus which could be as tall as a 4-story building! Others were tiny, like Microraptor which was about the size of a chicken.",
    "Not all dinosaurs were fierce carnivores like T-Rex. Many were plant-eaters that grazed peacefully, like Triceratops.",
    "Scientists learn about dinosaurs by studying fossils - the preserved remains or traces of ancient animals found in rocks.",
  ],
  5: [
    "Weather happens in Earth's atmosphere and includes things like rain, snow, wind, and sunshine. It can change from day to day or even hour to hour!",
    "Rainbows form when sunlight passes through water droplets in the air, splitting into the different colors we can see.",
    "Lightning is a giant spark of electricity that happens during thunderstorms. The thunder you hear is the sound of air expanding rapidly from the heat of the lightning.",
    "Seasons change because of how Earth tilts as it orbits the Sun. When your part of Earth is tilted toward the Sun, it's summer. When it's tilted away, it's winter.",
  ],
  6: [
    "Sports are activities that involve physical skill and often competition. They're a great way to have fun, stay healthy, and learn about teamwork!",
    "There are so many different types of sports - team sports like soccer and basketball, individual sports like swimming and gymnastics, and even mind sports like chess.",
    "The Olympic Games bring together athletes from all over the world every four years to compete in many different sports.",
    "Playing sports helps keep your body healthy and strong. It also teaches important skills like cooperation, perseverance, and good sportsmanship.",
  ],
  7: [
    "Technology is all about using knowledge to create tools, machines, and systems that solve problems and make our lives easier.",
    "Robots are machines that can be programmed to perform tasks automatically. Some robots build cars in factories, while others explore places too dangerous for humans.",
    "Computers use a special language called code to receive instructions. People who write these instructions are called programmers or coders.",
    "Artificial Intelligence (AI) is technology that allows machines to learn from experience and solve problems in ways that seem smart, kind of like how humans think.",
  ],
  8: [
    "The ocean covers more than 70% of Earth's surface and contains about 97% of all water on our planet!",
    "The deepest part of the ocean is called the Mariana Trench, and it's almost 7 miles deep - that's like stacking 20 Empire State Buildings on top of each other!",
    "Scientists estimate that more than 80% of the ocean remains unexplored. We actually know more about the surface of Mars than the bottom of our oceans!",
    "The ocean is home to an amazing variety of life, from tiny plankton to the blue whale - the largest animal ever known to have lived on Earth.",
  ],
  9: [
    "Mythical creatures are imaginary beings that appear in stories, legends, and folklore from different cultures around the world.",
    "Dragons are one of the most famous mythical creatures and appear in stories from many different cultures. Some are fierce and breathe fire, while others are wise and friendly.",
    "Unicorns are magical horses with a single horn on their forehead. In medieval times, people believed unicorn horns had healing powers!",
    "Many mythical creatures combine features from different animals, like the griffin (part eagle, part lion) or the mermaid (part human, part fish).",
  ],
  10: [
    "The sky appears blue because sunlight contains all colors of the rainbow, but air molecules scatter blue light more than other colors as sunlight travels through the atmosphere.",
    "Rainbows form when sunlight passes through water droplets in the air. The water acts like a prism, splitting the light into different colors.",
    "Yawning might be contagious because it was once a way for our ancestors to communicate and synchronize their behavior. When one person yawned, it signaled to others that it was time to be alert or time to rest.",
    "Leaves change color in autumn because they stop producing chlorophyll (which makes them green). This reveals other colorful pigments that were there all along!",
  ],
  11: [
    "Math is a universal language that helps us understand patterns and relationships in the world around us.",
    "The concept of zero as a number was a revolutionary idea! Different cultures developed it independently, but it wasn't widely used in Europe until the 12th century.",
    "Geometry helps us understand shapes and spaces. The ancient Egyptians used geometry to rebuild their farmland boundaries after the Nile River flooded each year.",
    "Math is everywhere in nature! The Fibonacci sequence (0, 1, 1, 2, 3, 5, 8, 13...) appears in flower petals, pinecones, and even the spiral of seashells.",
  ],
  12: [
    "LEGO was invented by Ole Kirk Christiansen, a carpenter from Denmark, in 1932. The name comes from the Danish words 'leg godt' which means 'play well'!",
    "There are over 400 billion LEGO bricks in the world - that's about 80 bricks for every person on Earth!",
    "The LEGO building system ensures that bricks made today still fit with bricks made in 1958 when the modern brick design was patented.",
    "The world's largest LEGO model was a Star Wars X-wing fighter, made of over 5 million bricks! It was 43 feet long with a 44-foot wingspan.",
  ]
};

/**
 * Generate a kid-friendly response based on the message and topic
 * 
 * @param {string} message - The question from the user
 * @param {number|object} topicId - The topic ID or topic object
 * @param {array} history - Chat history (not used in local generation)
 * @returns {object} - Response object with response text and source
 */
function generateResponse(message, topic, history = []) {
  try {
    // Handle if topic is passed as an object or as a topic ID
    const topicIdNum = typeof topic === 'object' ? Number(topic.id) : Number(topic);
    
    // Check if we have responses for this topic
    if (!topicResponses[topicIdNum]) {
      logger.warn(`Unknown topic ID: ${topicIdNum}, defaulting to generic response`);
      return {
        response: "I'm not sure about that topic yet, but I'd love to talk about animals, space, dinosaurs, or many other fun subjects!",
        source: 'local'
      };
    }
    
    // Pick a random response from the available ones for this topic
    const responses = topicResponses[topicIdNum];
    const randomIndex = Math.floor(Math.random() * responses.length);
    
    logger.info(`Generated local response for topic ID: ${topicIdNum}`);
    
    return {
      response: responses[randomIndex],
      source: 'local'
    };
  } catch (error) {
    logger.error(`Error generating local response: ${error.message}`);
    return {
      response: "I'm sorry, I'm having trouble thinking of an answer right now. Could you ask me something else?",
      source: 'local-error'
    };
  }
}

/**
 * Legacy function for backward compatibility
 * 
 * @param {string} message - The question from the user
 * @param {number} topicId - The topic ID
 * @returns {string} - The generated response
 */
function generateLocalResponse(message, topicId) {
  const result = generateResponse(message, topicId);
  return result.response;
}

module.exports = {
  generateResponse,
  generateLocalResponse
};
