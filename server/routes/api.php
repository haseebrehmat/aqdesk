<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AnswerController;
use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ConsultationController;
use App\Http\Controllers\Api\ContentReportController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\NewsletterController;
use App\Http\Controllers\Api\OpportunityController;
use App\Http\Controllers\Api\PodcastController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\QuestionController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\SocialAuthController;
use App\Http\Controllers\Api\TagController;
use App\Http\Controllers\Api\VoteController;
use Illuminate\Support\Facades\Route;

// Public Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/newsletter/subscribe', [NewsletterController::class, 'subscribe']);

// Social Authentication Routes
Route::get('/auth/providers', [SocialAuthController::class, 'providers']);
Route::get('/auth/{provider}/redirect', [SocialAuthController::class, 'redirectToProvider']);
Route::get('/auth/{provider}/callback', [SocialAuthController::class, 'handleProviderCallback']);
Route::post('/auth/exchange', [SocialAuthController::class, 'exchange']);

Route::get('/settings', [SettingController::class, 'show']);
Route::get('/settings/logo', [SettingController::class, 'logo']);

Route::get('/questions', [QuestionController::class, 'index']);
Route::get('/questions/{slug}', [QuestionController::class, 'show']);
Route::get('/tags', [TagController::class, 'index']);
Route::get('/public/projects', [ProjectController::class, 'publicIndex']);
Route::get('/public/projects/{id}', [ProjectController::class, 'publicShow']);
Route::get('/opportunities', [OpportunityController::class, 'index']);
Route::get('/opportunities/{opportunity}', [OpportunityController::class, 'show']);
Route::post('/applications', [ApplicationController::class, 'store'])->middleware('throttle:10,1');

Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{event}', [EventController::class, 'show']);

Route::get('/podcasts', [PodcastController::class, 'index']);
Route::get('/podcasts/{podcast}', [PodcastController::class, 'show']);
Route::get('/podcasts/{podcast}/audio', [PodcastController::class, 'audio']);

// Protected Routes (Sanctum Authenticated)
Route::middleware(['auth:sanctum', 'active'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::get('/dashboard/summary', [DashboardController::class, 'summary']);

    Route::middleware('role:Admin')->prefix('admin')->group(function () {
        Route::post('/settings', [SettingController::class, 'update']);
        Route::get('/roles', [AdminController::class, 'roles']);
        Route::get('/users', [AdminController::class, 'index']);
        Route::post('/users', [AdminController::class, 'store']);
        Route::put('/users/{id}', [AdminController::class, 'updateUser']);
        Route::delete('/users/{id}', [AdminController::class, 'destroy']);
        Route::patch('/opportunities/{opportunity}/status', [OpportunityController::class, 'moderate']);
        Route::get('/newsletter/subscribers', [NewsletterController::class, 'index']);
        Route::post('/newsletter/campaigns', [NewsletterController::class, 'broadcast']);
        Route::get('/newsletter/campaigns', [NewsletterController::class, 'campaigns']);
        Route::post('/newsletter/campaigns/drafts', [NewsletterController::class, 'storeDraft']);
        Route::put('/newsletter/campaigns/{campaign}', [NewsletterController::class, 'updateDraft']);
        Route::post('/newsletter/campaigns/{campaign}/send', [NewsletterController::class, 'sendDraft']);
        Route::get('/content-reports', [ContentReportController::class, 'index']);
        Route::patch('/content-reports/{report}', [ContentReportController::class, 'moderate']);
    });

    // Profile Routes
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);

    // Community Q&A Routes
    Route::post('/questions', [QuestionController::class, 'store']);
    Route::put('/questions/{slug}', [QuestionController::class, 'update']);
    Route::delete('/questions/{slug}', [QuestionController::class, 'destroy']);

    Route::post('/questions/{slug}/answers', [AnswerController::class, 'store']);
    Route::patch('/answers/{id}/accept', [AnswerController::class, 'markAccepted']);

    // Voting
    Route::post('/questions/{slug}/vote', [VoteController::class, 'voteQuestion']);
    Route::post('/answers/{id}/vote', [VoteController::class, 'voteAnswer']);
    Route::post('/content-reports', [ContentReportController::class, 'store']);

    // Opportunity management for employers
    Route::middleware('role:Expert,Admin')->group(function () {
        Route::post('/opportunities', [OpportunityController::class, 'store']);
        Route::put('/opportunities/{opportunity}', [OpportunityController::class, 'update']);
        Route::delete('/opportunities/{opportunity}', [OpportunityController::class, 'destroy']);
        Route::patch('/opportunities/{opportunity}/lifecycle', [OpportunityController::class, 'updateLifecycle']);
        Route::post('/events', [EventController::class, 'store']);
        Route::post('/podcasts', [PodcastController::class, 'store']);
    });

    // Applications routes
    Route::get('/applications', [ApplicationController::class, 'index']);
    Route::get('/applications/{application}/resume', [ApplicationController::class, 'resume']);
    Route::patch('/applications/{application}/status', [ApplicationController::class, 'updateStatus']);

    // Project CRUD
    Route::get('/projects', [ProjectController::class, 'index']);
    Route::get('/projects/{id}', [ProjectController::class, 'show']);
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::put('/projects/{id}', [ProjectController::class, 'update']);
    Route::delete('/projects/{id}', [ProjectController::class, 'destroy']);

    // Project Invitations & Membership
    Route::post('/projects/{id}/invitations', [ProjectController::class, 'generateInvite']);
    Route::post('/projects/join/{token}', [ProjectController::class, 'joinProject']);
    Route::put('/projects/{id}/members/{userId}', [ProjectController::class, 'updateMemberRole']);
    Route::delete('/projects/{id}/members/{userId}', [ProjectController::class, 'removeMember']);

    // File Actions
    Route::post('/projects/{id}/files', [ProjectController::class, 'uploadFile']);
    Route::delete('/files/{fileId}', [ProjectController::class, 'deleteFile']);

    // Feedback Actions
    Route::post('/projects/{id}/feedback', [ProjectController::class, 'addFeedback']);
    Route::delete('/feedback/{feedbackId}', [ProjectController::class, 'deleteFeedback']);

    // Events
    Route::put('/events/{event}', [EventController::class, 'update']);
    Route::delete('/events/{event}', [EventController::class, 'destroy']);
    Route::post('/events/{event}/register', [EventController::class, 'register']);
    Route::delete('/events/{event}/register', [EventController::class, 'unregister']);
    Route::get('/events/{event}/calendar', [EventController::class, 'calendar']);

    // Podcasts
    Route::delete('/podcasts/{podcast}', [PodcastController::class, 'destroy']);

    // Advisory Consultation Routes
    Route::get('/consultations', [ConsultationController::class, 'index']);
    Route::get('/consultations/experts', [ConsultationController::class, 'experts']);
    Route::get('/consultations/availability', [ConsultationController::class, 'availability']);
    Route::post('/consultations/availability', [ConsultationController::class, 'storeAvailability']);
    Route::delete('/consultations/availability/{availability}', [ConsultationController::class, 'destroyAvailability']);
    Route::post('/consultations', [ConsultationController::class, 'store']);
    Route::patch('/consultations/{consultation}/status', [ConsultationController::class, 'updateStatus']);
    Route::put('/consultations/{consultation}/proposal', [ConsultationController::class, 'saveProposal']);
});
