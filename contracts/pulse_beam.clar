;; PulseBeam Task Tracker Contract

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-invalid-task (err u101))
(define-constant err-invalid-status (err u102))
(define-constant err-invalid-notification (err u103))

;; Data variables
(define-data-var task-counter uint u0)

;; Define types
(define-map tasks uint {
    title: (string-ascii 64),
    deadline: uint,
    status: (string-ascii 20),
    notification-type: (string-ascii 10),
    owner: principal
})

(define-map user-preferences principal {
    notification-preference: (string-ascii 10)
})

;; Public functions
(define-public (create-task (title (string-ascii 64)) (deadline uint) (notification-type (string-ascii 10)))
    (let ((task-id (+ (var-get task-counter) u1)))
        (try! (validate-notification-type notification-type))
        (map-set tasks task-id {
            title: title,
            deadline: deadline,
            status: "pending",
            notification-type: notification-type,
            owner: tx-sender
        })
        (var-set task-counter task-id)
        (ok task-id)
    )
)

(define-public (update-task-status (task-id uint) (new-status (string-ascii 20)))
    (let ((task (unwrap! (map-get? tasks task-id) err-invalid-task)))
        (asserts! (is-eq (get owner task) tx-sender) err-owner-only)
        (try! (validate-status new-status))
        (ok (map-set tasks task-id 
            (merge task { status: new-status })))
    )
)

(define-public (set-notification-preferences (preference (string-ascii 10)))
    (try! (validate-notification-type preference))
    (ok (map-set user-preferences tx-sender 
        { notification-preference: preference }))
)

;; Read only functions
(define-read-only (get-task-details (task-id uint))
    (ok (unwrap! (map-get? tasks task-id) err-invalid-task))
)

(define-read-only (get-user-preferences (user principal))
    (ok (default-to 
        { notification-preference: "both" }
        (map-get? user-preferences user)))
)

;; Private functions
(define-private (validate-status (status (string-ascii 20)))
    (if (or 
        (is-eq status "pending")
        (is-eq status "completed")
        (is-eq status "cancelled"))
        (ok true)
        err-invalid-status
    )
)

(define-private (validate-notification-type (notification-type (string-ascii 10)))
    (if (or
        (is-eq notification-type "light")
        (is-eq notification-type "sound")
        (is-eq notification-type "both"))
        (ok true)
        err-invalid-notification
    )
)
