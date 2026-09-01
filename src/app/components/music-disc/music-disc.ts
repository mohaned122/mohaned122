import { Component, Inject, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SongService } from '../../services/song.service';
import { Song } from '../../models/song.model';

@Component({
  selector: 'app-music-disc',
  imports: [],
  templateUrl: './music-disc.html',
})
export class MusicDisc {
  private songService = inject(SongService);
  playing = signal(false);
  songTitle = signal('');
  coverSrc = signal("avatar/whats-up.png");
  private audio: HTMLAudioElement | null = null;
  private songs: Song[] = [];
  private currentIndex = 0;
  private loaded = false;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    if (isPlatformBrowser(this.platformId)) {
      this.loadSongs();
    }
  }

  private loadSongs() {
    this.songService.getAll().subscribe((songs) => {
      this.songs = songs;
      if (songs.length) {
        const seed = new Date().toDateString();
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
          hash = ((hash << 5) - hash) + seed.charCodeAt(i);
          hash |= 0;
        }
        this.currentIndex = Math.abs(hash) % songs.length;
        this.loadAudio(songs[this.currentIndex]);
      }
    });
  }

  private async loadAudio(song: Song) {
    const base64 = await this.songService.getAudio(song.id!);
    this.songTitle.set(song.title);
    this.audio = new Audio('data:' + song.mime + ';base64,' + base64);
    this.audio.loop = false;
    this.audio.volume = 0.5;
    this.audio.addEventListener('ended', () => this.next());
    this.loaded = true;
  }

  private next() {
    if (!this.songs.length) return;
    this.currentIndex = (this.currentIndex + 1) % this.songs.length;
    this.loadAudio(this.songs[this.currentIndex]).then(() => {
      this.audio!.play().then(() => {
        this.playing.set(true);
        this.coverSrc.set('avatar/profile.jpg');
      }).catch(() => {});
    });
  }

  togglePlay() {
    if (!this.audio || !this.loaded) return;
    if (this.playing()) {
      this.audio.pause();
      this.playing.set(false);
      this.coverSrc.set("avatar/whats-up.png");
    } else {
      this.audio.play().then(() => {
        this.playing.set(true);
        this.coverSrc.set('avatar/profile.jpg');
      }).catch(() => {});
    }
  }
}
