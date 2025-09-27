import { useTranslation } from '../hooks/useTranslation';

export type Template = { name: string, nameKey: string; prompt: string; };

const eventTemplatesData: Omit<Template, 'name'>[] = [
    { nameKey: 'templates.event.wedding', prompt: 'A beautiful wedding invitation background with elegant floral arrangements, soft lighting, and a romantic atmosphere.' },
    { nameKey: 'templates.event.engagement', prompt: 'An elegant engagement announcement background with romantic elements like hearts, rings, and a sophisticated color palette.' },
    { nameKey: 'templates.event.birthday', prompt: 'A fun birthday party background with colorful balloons, confetti, streamers, and a celebratory mood.' },
    { nameKey: 'templates.event.baby_shower', prompt: 'A cute baby shower invitation background with pastel colors, baby-related illustrations like rattles or strollers, and a gentle, welcoming feel.' },
    { nameKey: 'templates.event.housewarming', prompt: 'A cozy housewarming party invitation background featuring warm lighting, elements of a new home like keys or a house illustration, and a welcoming vibe.' },
    { nameKey: 'templates.event.naming_ceremony', prompt: 'A traditional and serene background for a naming ceremony, with auspicious symbols, gentle colors, and a respectable, celebratory feel.' },
    { nameKey: 'templates.event.birth_announcement', prompt: 'A sweet and tender birth announcement background, with soft pastel colors, cute baby-themed illustrations, and a joyful atmosphere.' },
    { nameKey: 'templates.event.death_announcement', prompt: 'A respectful and serene memorial background with muted colors, gentle floral elements like lilies, and a peaceful, somber mood.' },
];

const festivalTemplatesData: Omit<Template, 'name'>[] = [
    { nameKey: 'templates.festival.diwali', prompt: 'A vibrant Diwali festival background with glowing diyas, festive lights, intricate rangoli patterns, and distant fireworks in a night sky.' },
    { nameKey: 'templates.festival.holi', prompt: 'A colorful Holi festival background featuring vibrant splashes of powder paint (gulal), water splashes, and an energetic, joyful atmosphere.' },
    { nameKey: 'templates.festival.navratri', prompt: 'A festive Navratri background with silhouettes of Garba dancers, traditional dandiya sticks, and vibrant Indian folk art patterns.' },
    { nameKey: 'templates.festival.raksha_bandhan', prompt: 'A warm and heartfelt Raksha Bandhan background with an elegant rakhi design, traditional Indian motifs, and a theme of sibling love.' },
    { nameKey: 'templates.festival.eid', prompt: 'An elegant Eid celebration background with a beautiful crescent moon, stars, a mosque silhouette against a twilight sky, and intricate Islamic patterns.' },
    { nameKey: 'templates.festival.ganesh_chaturthi', prompt: 'A devotional Ganesh Chaturthi background featuring hibiscus flowers, modaks, and traditional Indian celebratory decorations.' },
    { nameKey: 'templates.festival.dussehra', prompt: 'A dramatic Dussehra background depicting the silhouette of Ravana with ten heads, a bow and arrow, and a fiery, victorious theme.' },
    { nameKey: 'templates.festival.janmashtami', prompt: 'A divine Janmashtami background featuring a bansuri (flute) and a peacock feather, with a serene and devotional atmosphere.' },
    { nameKey: 'templates.festival.shivjayanti', prompt: 'A powerful and celebratory Shiv Jayanti background with saffron flags (Bhagwa dhwaj), silhouettes of forts, and a majestic, historical theme honoring Shivaji Maharaj.' },
    { nameKey: 'templates.festival.gudi_padwa', prompt: 'A festive Gudi Padwa background with a traditional Gudi (a pole with a bright cloth, neem leaves, and a garland), mango leaves, and a celebratory Maharashtrian theme.' },
    { nameKey: 'templates.festival.new_year', prompt: 'A celebratory New Year background with spectacular fireworks bursting in a night sky, glittering confetti, and a festive, exciting atmosphere.' },
];

export const useTemplates = () => {
    const { t } = useTranslation();
    
    const eventTemplates: Template[] = eventTemplatesData.map(template => ({
        ...template,
        name: t(template.nameKey as any), // Cast to any to satisfy TS
    }));

    const festivalTemplates: Template[] = festivalTemplatesData.map(template => ({
        ...template,
        name: t(template.nameKey as any),
    }));

    return { eventTemplates, festivalTemplates };
};