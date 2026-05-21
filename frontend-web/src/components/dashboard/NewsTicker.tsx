import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Newspaper } from 'lucide-react';
import api from '@/services/api';

interface NewsItem {
  id: string;
  title: string;
  source: string;
  url?: string;
  category: string;
  publishedAt: string;
}

export function NewsTicker() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await api.get('/news');
        setNews(Array.isArray(res.data) ? res.data : []);
      } catch {
        setNews([]);
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-3">
          <div className="animate-pulse h-4 bg-slate-200 rounded w-3/4" />
        </CardContent>
      </Card>
    );
  }

  if (news.length === 0) return null;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-stretch">
          <div className="flex items-center gap-2 bg-nu-green text-white px-3 py-2 shrink-0">
            <Newspaper size={16} />
            <span className="text-xs font-bold whitespace-nowrap">BERITA</span>
          </div>
          <div ref={containerRef} className="overflow-hidden flex-1 py-2 px-3">
            <div className="flex gap-8 animate-marquee" style={{ minWidth: 'max-content' }}>
              {news.map((item) => (
                <a
                  key={item.id}
                  href={item.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-slate-700 hover:text-nu-green whitespace-nowrap shrink-0"
                >
                  <Badge variant="outline" className="text-[10px] px-1 py-0">
                    {item.source}
                  </Badge>
                  <span>{item.title}</span>
                  <ExternalLink size={12} className="text-slate-400" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default NewsTicker;
