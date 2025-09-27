import { useTranslation } from '../hooks/useTranslation';

export type Template = { name: string, nameKey: string; prompt: string; fields?: string[]; };

const eventTemplatesData: Omit<Template, 'name'>[] = [
    { nameKey: 'templates.event.wedding', prompt: 'Turn the uploaded image into a beautiful wedding invitation poster', fields: ["Couple's Names", "Date", "Location", "Pincode"] },
    { nameKey: 'templates.event.engagement', prompt: 'Turn the uploaded image into an elegant engagement announcement poster', fields: ["Couple's Names", "Date"] },
    { nameKey: 'templates.event.birthday', prompt: 'Turn the uploaded image into a fun birthday party invitation', fields: ["Name", "Age", "Date & Time", "Location", "Pincode"] },
    { nameKey: 'templates.event.baby_shower', prompt: 'Turn the uploaded image into a cute baby shower invitation', fields: ["Parent(s)-to-be", "Date & Time", "Location", "Pincode"] },
    { nameKey: 'templates.event.housewarming', prompt: 'Turn the uploaded image into a cozy housewarming party invitation', fields: ["Host(s) Name(s)", "Date & Time", "Address"] },
    { nameKey: 'templates.event.naming_ceremony', prompt: 'Turn the uploaded image into a poster for a naming ceremony', fields: ["Child's Name", "Date & Time", "Location", "Pincode"] },
    { nameKey: 'templates.event.birth_announcement', prompt: 'Turn the uploaded image into a sweet birth announcement poster', fields: ["Baby's Name", "Date of Birth", "Parents' Names"] },
    { nameKey: 'templates.event.death_announcement', prompt: 'Turn the uploaded image into a respectful memorial poster', fields: ["Name of Deceased", "Life Dates (e.g., 1950-2024)"] },
];

const festivalTemplatesData: Omit<Template, 'name'>[] = [
    { nameKey: 'templates.festival.diwali', prompt: 'Turn the uploaded image into a vibrant Diwali festival poster with diyas and fireworks, saying "Happy Diwali"' },
    { nameKey: 'templates.festival.holi', prompt: 'Turn the uploaded image into a colorful Holi festival poster with splashes of color, with the text "Happy Holi"' },
    { nameKey: 'templates.festival.navratri', prompt: 'Turn the uploaded image into a festive Navratri poster with Garba dancers and traditional decorations, with the text "Happy Navratri"' },
    { nameKey: 'templates.festival.raksha_bandhan', prompt: 'Turn the uploaded image into a poster celebrating Raksha Bandhan, adding a decorative rakhi' },
    { nameKey: 'templates.festival.eid', prompt: 'Turn the uploaded image into an elegant Eid Mubarak poster with a crescent moon and mosque silhouette' },
    { nameKey: 'templates.festival.ganesh_chaturthi', prompt: 'Turn the uploaded image into a poster for Ganesh Chaturthi, incorporating festive elements like modaks' },
    { nameKey: 'templates.festival.dussehra', prompt: 'Turn the uploaded image into a poster for Dussehra, themed around the victory of good over evil' },
    { nameKey: 'templates.festival.janmashtami', prompt: 'Turn the uploaded image into a poster for Janmashtami celebrating the birth of Krishna, adding a flute and peacock feather' },
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
