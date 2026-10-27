import { BackgroundPreset } from '../types';

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  {
    id: 'midnight',
    nameKk: 'Midnight Navy (Түнгі көк)',
    descriptionKk: 'Классикалық терең көк түс градиенті',
    cssBackground: 'linear-gradient(145deg, #101923 0%, #17232D 60%, #0c141c 100%)',
    previewGradient: 'linear-gradient(135deg, #101923, #17232D)',
  },
  {
    id: 'navy-sage',
    nameKk: 'Navy-to-Sage (Көк пен сәлдегүл)',
    descriptionKk: 'Тыныштандыратын көк және сәлдегүл реңктері',
    cssBackground: 'linear-gradient(140deg, #101923 0%, #17272b 45%, #233b33 100%)',
    previewGradient: 'linear-gradient(135deg, #101923, #233b33)',
  },
  {
    id: 'deep-blue',
    nameKk: 'Deep Blue (Тұңғиық көк)',
    descriptionKk: 'Бай әрі терең мұхиттық көк градиент',
    cssBackground: 'linear-gradient(145deg, #0b1523 0%, #13243a 50%, #1a2f4a 100%)',
    previewGradient: 'linear-gradient(135deg, #0b1523, #1a2f4a)',
  },
  {
    id: 'charcoal',
    nameKk: 'Charcoal (Көмірлі графит)',
    descriptionKk: 'Ұстамды, байыпты қара-сұр градиент',
    cssBackground: 'linear-gradient(145deg, #12161a 0%, #1b2126 50%, #252d34 100%)',
    previewGradient: 'linear-gradient(135deg, #12161a, #252d34)',
  },
  {
    id: 'radial-glow',
    nameKk: 'Soft Navy Glow (Жұмсақ сәуле)',
    descriptionKk: 'Жоғары жақтан түскен нәзік радиалды сәуле',
    cssBackground: 'radial-gradient(ellipse 90% 65% at 50% 0%, #1f3546 0%, #101923 75%)',
    previewGradient: 'radial-gradient(circle at 50% 30%, #1f3546, #101923)',
  },
];

export function getPresetById(id: string): BackgroundPreset {
  const found = BACKGROUND_PRESETS.find((p) => p.id === id);
  return found || BACKGROUND_PRESETS[0];
}
