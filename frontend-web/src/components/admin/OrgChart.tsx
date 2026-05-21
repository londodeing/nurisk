import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, Plus, AlertTriangle, User
} from 'lucide-react';
import api from '@/services/api';

interface OrgNode {
  id: string;
  name: string;
  position: string;
  userId?: string;
  userName?: string;
  children: OrgNode[];
  spanOfControl: number;
  maxSpan: number;
}

export default function OrgChart() {
  const [selectedNode, setSelectedNode] = useState<OrgNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignUser, setAssignUser] = useState('');

  const { data: orgData } = useQuery<OrgNode>({
    queryKey: ['org-chart'],
    queryFn: async () => {
      const res = await api.get('/org/chart');
      return res.data;
    },
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users', searchQuery],
    queryFn: async () => {
      const res = await api.get(`/users/search?q=${searchQuery}`);
      return res.data;
    },
    enabled: searchQuery.length > 2,
  });

  const handleAssign = useCallback(async () => {
    if (!selectedNode || !assignUser) return;
    
    try {
      await api.post(`/org/positions/${selectedNode.id}/assign`, { userId: assignUser });
      setIsAssigning(false);
      setAssignUser('');
    } catch (error) {
      console.error('Assign error:', error);
    }
  }, [selectedNode, assignUser]);

  const renderNode = (node: OrgNode, level: number = 0) => {
    const isOverLimit = node.spanOfControl > node.maxSpan;
    const isSelected = selectedNode?.id === node.id;

    return (
      <div key={node.id} className="flex flex-col items-center">
        <Card 
          className={`w-48 cursor-pointer transition-all ${
            isSelected ? 'border-nu-green ring-2 ring-nu-green' : ''
          } ${isOverLimit ? 'border-danger-red' : ''}`}
          onClick={() => setSelectedNode(node)}
        >
          <CardContent className="p-3 text-center">
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <User className="w-5 h-5 text-slate-400" />
            </div>
            <p className="font-medium text-sm">{node.position}</p>
            {node.userName ? (
              <p className="text-xs text-slate-500">{node.userName}</p>
            ) : (
              <p className="text-xs text-slate-400 italic">Kosong</p>
            )}
            <div className="mt-2 flex items-center justify-center gap-1">
              <Badge variant={isOverLimit ? 'destructive' : 'secondary'}>
                {node.spanOfControl}/{node.maxSpan}
              </Badge>
            </div>
            {isOverLimit && (
              <Alert variant="destructive" className="mt-2 p-2">
                <AlertTriangle className="w-3 h-3" />
                <AlertDescription className="text-xs">Melebihi batas!</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {node.children.length > 0 && (
          <div className="flex gap-4 mt-4">
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Org Chart */}
      <div className="col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Organization Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto">
              {orgData && renderNode(orgData)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Position Details */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Position Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedNode ? (
              <div className="space-y-4">
                <div>
                  <Label>Position</Label>
                  <p className="font-medium">{selectedNode.position}</p>
                </div>
                <div>
                  <Label>Current Assignee</Label>
                  <p>{selectedNode.userName || 'None'}</p>
                </div>
                <div>
                  <Label>Span of Control</Label>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{selectedNode.spanOfControl} / {selectedNode.maxSpan}</span>
                    {selectedNode.spanOfControl > selectedNode.maxSpan && (
                      <Alert variant="destructive" className="p-2">
                        <AlertTriangle className="w-3 h-3" />
                      </Alert>
                    )}
                  </div>
                </div>
                <Button onClick={() => setIsAssigning(true)} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Assign User
                </Button>

                {isAssigning && (
                  <div className="space-y-2 pt-2">
                    <Input
                      placeholder="Search user..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {users.length > 0 && (
                      <div className="max-h-32 overflow-y-auto border rounded">
                        {users.map((user: { id: string; name: string }) => (
                          <button
                            key={user.id}
                            onClick={() => setAssignUser(user.id)}
                            className={`w-full p-2 text-left hover:bg-slate-50 ${
                              assignUser === user.id ? 'bg-nu-green/10' : ''
                            }`}
                          >
                            {user.name}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setIsAssigning(false)}>
                        Batal
                      </Button>
                      <Button onClick={handleAssign} disabled={!assignUser}>
                        Simpan
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-500">Select a position to view details</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}