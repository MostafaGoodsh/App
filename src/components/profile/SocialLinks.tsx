import { 
  Instagram, 
  Twitter, 
  Linkedin, 
  Facebook, 
  Globe,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { type Profile } from '@/hooks/useProfile';

interface SocialLinksProps {
  profile: Profile;
}

export function SocialLinks({ profile }: SocialLinksProps) {
  const socialLinks = [
    {
      name: 'الموقع الشخصي',
      url: profile.website_url,
      icon: Globe,
      color: 'text-blue-600 hover:text-blue-700'
    },
    {
      name: 'Instagram',
      url: profile.instagram_url,
      icon: Instagram,
      color: 'text-pink-600 hover:text-pink-700'
    },
    {
      name: 'Twitter',
      url: profile.twitter_url,
      icon: Twitter,
      color: 'text-sky-600 hover:text-sky-700'
    },
    {
      name: 'LinkedIn',
      url: profile.linkedin_url,
      icon: Linkedin,
      color: 'text-blue-700 hover:text-blue-800'
    },
    {
      name: 'Facebook',
      url: profile.facebook_url,
      icon: Facebook,
      color: 'text-blue-800 hover:text-blue-900'
    }
  ];

  const availableLinks = socialLinks.filter(link => link.url && link.url.trim() !== '');

  if (availableLinks.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="arabic-text">
          روابط التواصل | Social Links
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {availableLinks.map((link) => {
            const IconComponent = link.icon;
            return (
              <Button
                key={link.name}
                variant="outline"
                size="sm"
                asChild
                className={`${link.color} transition-colors`}
              >
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="arabic-text">{link.name}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}