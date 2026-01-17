import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Trash2, Edit2, Save, X, Video } from 'lucide-react';

interface InstallationVideo {
  id: string;
  step_number: number;
  title: string;
  description: string;
  video_url: string;
  tips: string[];
  warnings: string[];
  order_position: number;
  is_active: boolean;
}

interface VideoForm {
  step_number: number;
  title: string;
  description: string;
  video_url: string;
  tips: string;
  warnings: string;
  order_position: number;
  is_active: boolean;
}

export function InstallationVideosManager() {
  const [videos, setVideos] = useState<InstallationVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<VideoForm>({
    step_number: 1,
    title: '',
    description: '',
    video_url: '',
    tips: '',
    warnings: '',
    order_position: 1,
    is_active: true
  });

  useEffect(() => {
    loadVideos();
  }, []);

  async function loadVideos() {
    try {
      const { data, error } = await supabase
        .from('installation_videos')
        .select('*')
        .order('order_position');

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      step_number: 1,
      title: '',
      description: '',
      video_url: '',
      tips: '',
      warnings: '',
      order_position: videos.length + 1,
      is_active: true
    });
    setEditingId(null);
    setShowAddForm(false);
  }

  function startEdit(video: InstallationVideo) {
    setFormData({
      step_number: video.step_number,
      title: video.title,
      description: video.description,
      video_url: video.video_url,
      tips: video.tips.join('\n'),
      warnings: video.warnings.join('\n'),
      order_position: video.order_position,
      is_active: video.is_active
    });
    setEditingId(video.id);
    setShowAddForm(false);
  }

  async function handleSave() {
    try {
      const videoData = {
        step_number: formData.step_number,
        title: formData.title,
        description: formData.description,
        video_url: formData.video_url,
        tips: formData.tips.split('\n').filter(t => t.trim()),
        warnings: formData.warnings.split('\n').filter(w => w.trim()),
        order_position: formData.order_position,
        is_active: formData.is_active
      };

      if (editingId) {
        const { error } = await supabase
          .from('installation_videos')
          .update(videoData)
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('installation_videos')
          .insert([videoData]);

        if (error) throw error;
      }

      await loadVideos();
      resetForm();
    } catch (error) {
      console.error('Error saving video:', error);
      alert('Ошибка сохранения видео');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Удалить это видео?')) return;

    try {
      const { error, count } = await supabase
        .from('installation_videos')
        .delete({ count: 'exact' })
        .eq('id', id);

      if (error) {
        console.error('Delete error:', error);
        alert(`Ошибка удаления: ${error.message}`);
        return;
      }

      if (count === 0) {
        alert('Видео не найдено или уже удалено');
        return;
      }

      alert('Видео успешно удалено');
      await loadVideos();
    } catch (error) {
      console.error('Error deleting video:', error);
      alert(`Ошибка удаления видео: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Видео установки</h2>
        <button
          onClick={() => {
            resetForm();
            setShowAddForm(true);
          }}
          className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors"
        >
          <Plus size={20} />
          Добавить видео
        </button>
      </div>

      {(showAddForm || editingId) && (
        <div className="bg-white border-2 border-cyan-200 rounded-lg p-6 space-y-4">
          <h3 className="text-xl font-bold">
            {editingId ? 'Редактировать видео' : 'Новое видео'}
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Номер шага</label>
              <input
                type="number"
                value={formData.step_number}
                onChange={(e) => setFormData({ ...formData, step_number: parseInt(e.target.value) })}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Порядок отображения</label>
              <input
                type="number"
                value={formData.order_position}
                onChange={(e) => setFormData({ ...formData, order_position: parseInt(e.target.value) })}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Заголовок</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2 border rounded-lg"
              placeholder="Название шага установки"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Описание</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border rounded-lg"
              rows={3}
              placeholder="Подробное описание шага"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">URL видео</label>
            <input
              type="text"
              value={formData.video_url}
              onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
              className="w-full p-2 border rounded-lg"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Советы (каждый с новой строки)</label>
            <textarea
              value={formData.tips}
              onChange={(e) => setFormData({ ...formData, tips: e.target.value })}
              className="w-full p-2 border rounded-lg"
              rows={3}
              placeholder="Совет 1&#10;Совет 2&#10;Совет 3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Предупреждения (каждое с новой строки)</label>
            <textarea
              value={formData.warnings}
              onChange={(e) => setFormData({ ...formData, warnings: e.target.value })}
              className="w-full p-2 border rounded-lg"
              rows={3}
              placeholder="Предупреждение 1&#10;Предупреждение 2"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="is_active" className="text-sm font-medium">Активно (показывать на сайте)</label>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save size={20} />
              Сохранить
            </button>
            <button
              onClick={resetForm}
              className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X size={20} />
              Отмена
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {videos.map((video) => (
          <div
            key={video.id}
            className={`bg-white border rounded-lg p-4 ${!video.is_active ? 'opacity-50' : ''}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl font-bold text-cyan-600">
                    {video.step_number}.
                  </span>
                  <h3 className="text-xl font-bold">{video.title}</h3>
                  {!video.is_active && (
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                      Неактивно
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-3">{video.description}</p>

                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <Video size={16} />
                  <a
                    href={video.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-cyan-600 truncate max-w-md"
                  >
                    {video.video_url}
                  </a>
                </div>

                {video.tips.length > 0 && (
                  <div className="mb-2">
                    <span className="text-sm font-medium text-green-600">
                      Советы: {video.tips.length}
                    </span>
                  </div>
                )}

                {video.warnings.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-red-600">
                      Предупреждения: {video.warnings.length}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(video)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Редактировать"
                >
                  <Edit2 size={20} />
                </button>
                <button
                  onClick={() => handleDelete(video.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Удалить"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {videos.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Video size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Видео установки ещё не добавлены</p>
        </div>
      )}
    </div>
  );
}
