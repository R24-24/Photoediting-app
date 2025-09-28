import { useTranslation } from '../hooks/useTranslation';

export type TemplateField = {
    id: string;
    labelKey: string;
    placeholderKey: string;
};

export type Template = { 
    name: string, 
    nameKey: string; 
    prompt: string; 
    fields?: TemplateField[];
};

const eventTemplatesData: Omit<Template, 'name'>[] = [
    { 
        nameKey: 'templates.event.wedding', 
        prompt: 'An elegant wedding invitation background. The design should feature soft floral borders, perhaps with gold accents, leaving a clean, clear space in the center for text. The overall mood should be romantic and sophisticated.',
        fields: [
            { id: 'brideGroom', labelKey: 'templates.fields.brideGroom', placeholderKey: 'templates.placeholders.brideGroom' },
            { id: 'date', labelKey: 'templates.fields.date', placeholderKey: 'templates.placeholders.date' },
            { id: 'venue', labelKey: 'templates.fields.venue', placeholderKey: 'templates.placeholders.venue' }
        ] 
    },
    { 
        nameKey: 'templates.event.engagement', 
        prompt: 'A sophisticated engagement announcement background. Use romantic elements like rings, hearts, or elegant patterns, ensuring there is a clear area for the announcement text.',
        fields: [
            { id: 'coupleName', labelKey: 'templates.fields.coupleName', placeholderKey: 'templates.placeholders.coupleName' },
            { id: 'date', labelKey: 'templates.fields.date', placeholderKey: 'templates.placeholders.date' },
            { id: 'venue', labelKey: 'templates.fields.venue', placeholderKey: 'templates.placeholders.venue' }
        ]
    },
    { 
        nameKey: 'templates.event.birthday', 
        prompt: 'A fun and vibrant birthday party invitation background. Use elements like balloons, confetti, and streamers. The design should be celebratory and have a clear area for event details.',
        fields: [
            { id: 'name', labelKey: 'templates.fields.name', placeholderKey: 'templates.placeholders.name' },
            { id: 'age', labelKey: 'templates.fields.age', placeholderKey: 'templates.placeholders.age' },
            { id: 'date', labelKey: 'templates.fields.date', placeholderKey: 'templates.placeholders.date' },
            { id: 'venue', labelKey: 'templates.fields.venue', placeholderKey: 'templates.placeholders.venue' }
        ]
    },
    { 
        nameKey: 'templates.event.baby_shower', 
        prompt: 'A cute and gentle baby shower invitation background. Incorporate pastel colors and baby-themed illustrations (like toys or animals), with a soft, welcoming feel and space for text.',
        fields: [
            { id: 'parentsName', labelKey: 'templates.fields.parentsName', placeholderKey: 'templates.placeholders.parentsName' },
            { id: 'date', labelKey: 'templates.fields.date', placeholderKey: 'templates.placeholders.date' },
            { id: 'venue', labelKey: 'templates.fields.venue', placeholderKey: 'templates.placeholders.venue' }
        ]
    },
    { 
        nameKey: 'templates.event.housewarming', 
        prompt: 'A cozy and welcoming housewarming party invitation background. Feature warm lighting and elements of a new home (like keys or a house illustration), with a friendly vibe and a spot for details.',
        fields: [
            { id: 'familyName', labelKey: 'templates.fields.familyName', placeholderKey: 'templates.placeholders.familyName' },
            { id: 'date', labelKey: 'templates.fields.date', placeholderKey: 'templates.placeholders.date' },
            { id: 'venue', labelKey: 'templates.fields.venue', placeholderKey: 'templates.placeholders.venue' }
        ]
    },
    { 
        nameKey: 'templates.event.naming_ceremony', 
        prompt: 'A traditional and serene background for a naming ceremony. Use auspicious symbols and gentle colors to create a respectable, celebratory feel, with a designated area for text.',
        fields: [
            { id: 'childName', labelKey: 'templates.fields.childName', placeholderKey: 'templates.placeholders.childName' },
            { id: 'parentsName', labelKey: 'templates.fields.parentsName', placeholderKey: 'templates.placeholders.parentsName' },
            { id: 'date', labelKey: 'templates.fields.date', placeholderKey: 'templates.placeholders.date' }
        ]
    },
    { 
        nameKey: 'templates.event.birth_announcement', 
        prompt: 'A sweet and tender birth announcement background. Use soft pastel colors and cute baby-themed illustrations to create a joyful atmosphere, with space for the happy news.',
        fields: [
            { id: 'announcement', labelKey: 'templates.fields.announcement', placeholderKey: 'templates.placeholders.announcement' },
            { id: 'childName', labelKey: 'templates.fields.childName', placeholderKey: 'templates.placeholders.childName' },
            { id: 'parentsName', labelKey: 'templates.fields.parentsName', placeholderKey: 'templates.placeholders.parentsName' }
        ]
    },
    { 
        nameKey: 'templates.event.death_announcement', 
        prompt: 'A respectful and serene memorial background. Use muted colors and gentle floral elements (like lilies or simple wreaths) to create a peaceful, somber mood. Ensure there is a clear, dignified space for text.',
        fields: [
            { id: 'deceasedName', labelKey: 'templates.fields.deceasedName', placeholderKey: 'templates.placeholders.deceasedName' },
            { id: 'ceremonyDetails', labelKey: 'templates.fields.ceremonyDetails', placeholderKey: 'templates.placeholders.ceremonyDetails' }
        ]
    },
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

const businessTemplatesData: Omit<Template, 'name'>[] = [
    {
        nameKey: 'templates.business.food',
        prompt: 'Create a delicious and mouth-watering poster for a food business. The design should be vibrant, using high-quality food imagery, and have a clear space for text. The mood should be appetizing and professional.',
    },
    {
        nameKey: 'templates.business.agency',
        prompt: 'Create a modern and professional poster for a marketing agency. The design should be clean, using abstract graphics, bold typography, and a corporate color palette. It should convey innovation and expertise, with space for key information.',
    },
    {
        nameKey: 'templates.business.real_estate',
        prompt: 'Create an elegant and trustworthy poster for a real estate business. The design should feature clean lines, professional fonts, and space for a property image or agent photo. The mood should be aspirational and reliable.',
    },
    {
        nameKey: 'templates.business.fashion',
        prompt: 'Create a stylish and chic poster for a fashion retail business. The design should be trendy, using elegant fonts and a minimalist layout that highlights fashion. The mood should be sophisticated and modern.',
    }
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
    
    const businessTemplates: Template[] = businessTemplatesData.map(template => ({
        ...template,
        name: t(template.nameKey as any),
    }));

    return { eventTemplates, festivalTemplates, businessTemplates };
};