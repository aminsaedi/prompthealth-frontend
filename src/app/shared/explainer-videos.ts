/*
 * Hedieh's two explainer videos (her request of 2026-10-15), with the title,
 * description, thumbnail, upload date and length exactly as YouTube shows
 * them, because the VideoObject markup built from them has to match the video
 * Google fetches. If a video is replaced on YouTube, its entry here changes
 * with it.
 */
export interface IExplainerVideo {
  id: string;
  title: string;
  description: string;
  uploadDate: string;
  duration: string;
}

export const PRO_EXPLAINER: IExplainerVideo = {
  id: 'SYsyDCSAX3Y',
  title: 'How Dental Practices Can Stay Active on Social Media (Without Expensive Production)',
  description: 'Running a dental practice and struggling to post consistently? Here\'s how dental teams can keep their social media active every week, without spending thousands on professional content production.',
  uploadDate: '2026-10-15T15:55:26-07:00',
  duration: 'PT1M53S',
};

export const ACADEMY_EXPLAINER: IExplainerVideo = {
  id: '9ca_Gsz66cc',
  title: 'How Health and Dental Professionals Can Get Found Online (Free Profile)',
  description: 'You don\'t need a full marketing team to build visibility online. In this video, Hedieh Safiyari, founder of PromptHealth, explains the basics that health, wellness and dental professionals can do themselves, starting with a free professional profile.',
  uploadDate: '2026-10-15T15:52:50-07:00',
  duration: 'PT3M19S',
};

export function videoObjectLd(video: IExplainerVideo): { [key: string]: any } {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title,
    description: video.description,
    thumbnailUrl: [
      `https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`,
      `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`,
    ],
    uploadDate: video.uploadDate,
    duration: video.duration,
    embedUrl: `https://www.youtube.com/embed/${video.id}`,
    contentUrl: `https://www.youtube.com/watch?v=${video.id}`,
    publisher: { '@type': 'Organization', name: 'PromptHealth', url: 'https://www.prompthealth.ca' },
  };
}
